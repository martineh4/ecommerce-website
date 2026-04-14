import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(cartItems);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity = 1 } = await req.json();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (product.stock < quantity) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: session.user.id, productId, quantity },
    include: { product: true },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productId = new URL(req.url).searchParams.get("productId");

  if (productId) {
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id, productId } });
  } else {
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity } = await req.json();

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
}
