import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: { include: { category: { select: { name: true, slug: true } } } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(cartItems);
  } catch {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (product.stock < quantity) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

    // Upsert on the compound (userId, productId) unique key so that adding an
    // item already in the cart increments its quantity rather than duplicating it.
    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: session.user.id, productId, quantity },
      include: { product: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const productId = new URL(req.url).searchParams.get("productId");

    // Omitting ?productId clears the entire cart (used on checkout). Including it
    // removes a single line item — both cases share one endpoint to keep the
    // client API surface small.
    if (productId) {
      await prisma.cartItem.deleteMany({ where: { userId: session.user.id, productId } });
    } else {
      await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });
    if (quantity === undefined || quantity === null) {
      return NextResponse.json({ error: "quantity is required" }, { status: 400 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { userId: session.user.id, productId } });
      return NextResponse.json({ success: true });
    }

    const item = await prisma.cartItem.update({
      where: { userId_productId: { userId: session.user.id, productId } },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    // P2025 = "Record to update not found" — the item was removed from the cart
    // in another tab or session between the client reading it and sending PATCH.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
  }
}
