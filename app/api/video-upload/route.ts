import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const { title, description, publicId, originalSize, compressedSize, duration } =
      await request.json();

    const video = await prisma.video.create({
      data: {
        userId,
        title,
        description,
        publicId,
        originalSize,
        compressedSize,
        duration: duration || 0,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.log("Upload video failed", error);
    return NextResponse.json(
      { error: "Upload video failed" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}