import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      userId: session.user.role === "ADMIN" ? undefined : session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, images: true, slug: true, price: true },
          },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
