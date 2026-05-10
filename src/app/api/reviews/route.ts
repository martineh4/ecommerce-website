import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { productId, rating, comment } = reviewSchema.parse(body);

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Prisma's upsert requires a unique where clause, but there's no
    // (userId, productId) unique constraint on the Review model. Work around
    // this by looking up the existing review id first: if found, upsert targets
    // that row; if not, the "new" sentinel will never match so Prisma falls
    // through to the create branch. This has a race condition (two concurrent
    // first-reviews could both create), but it's acceptable for a one-review-
    // per-user requirement that isn't enforced at the DB level.
    const review = await prisma.review.upsert({
      where: {
        id: (await prisma.review.findFirst({
          where: { userId: session.user.id, productId },
          select: { id: true },
        }))?.id ?? "new",
      },
      update: { rating, comment },
      create: { userId: session.user.id, productId, rating, comment },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
