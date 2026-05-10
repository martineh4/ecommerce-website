import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch {
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { productId } = body;
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    // upsert with an empty update is intentional: it makes the POST idempotent.
    // If the user somehow fires the request twice (double-click, retry), the
    // second call is a no-op rather than throwing a unique-constraint error.
    const favorite = await prisma.favorite.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: {},
      create: { userId: session.user.id, productId },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const productId = new URL(req.url).searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    await prisma.favorite.deleteMany({
      where: { userId: session.user.id, productId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
