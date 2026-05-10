import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createOrderSchema = z.object({
  address: z.string().min(5),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ).min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, images: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { address, items } = createOrderSchema.parse(body);

    // Trust the client-supplied price rather than re-fetching from the DB.
    // This preserves what the user saw when they added items — a product's
    // price may change between add-to-cart and checkout, and the order line
    // item should reflect what was actually agreed at purchase time.
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Wrap everything in a transaction so a partial failure (e.g. stock runs
    // out mid-loop) doesn't leave orphaned orders or incorrect stock counts.
    const order = await prisma.$transaction(async (tx) => {
      // Check stock before creating the order — if we created first and then
      // found insufficient stock, we'd have to roll back an already-created order.
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }

      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total,
          address,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear the DB cart inside the same transaction so the cart is never
      // empty without a corresponding order, or vice-versa on rollback.
      await tx.cartItem.deleteMany({ where: { userId: session.user.id } });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    // Surface Prisma errors as 500 — they indicate infrastructure problems, not
    // client mistakes, so we must not leak their messages to the response.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientUnknownRequestError
    ) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    // Our own throws (e.g. "Insufficient stock…") are intentional domain errors.
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
