import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = params.id;

    const video = await prisma.video.findUnique({
      where: { id: videoId as any, userId: userId || undefined },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Cloudinary credentials not found" },
        { status: 500 }
      );
    }

    // Delete from Cloudinary (ignore failures, but log them)
    try {
      await cloudinary.uploader.destroy(video.publicId, {
        resource_type: "video",
      });
    } catch (err) {
      console.error("Failed to delete video from Cloudinary", err);
    }

    await prisma.video.delete({
      where: { id: videoId as any },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete video failed", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


