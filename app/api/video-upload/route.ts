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

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { title, description, publicId, originalSize, duration } =
      await request.json();

    // Fetch actual compressed size from Cloudinary
    let compressedSize = originalSize;
    try {
      const resource = await cloudinary.api.resource(publicId, {
        resource_type: "video",
      });
      compressedSize = String(resource.bytes);
    } catch (e) {
      console.log("Could not fetch compressed size", e);
    }

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
    return NextResponse.json({ error: "Upload video failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}