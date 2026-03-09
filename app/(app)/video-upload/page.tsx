"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quality, setQuality] = useState<"auto" | "auto:eco" | "auto:good" | "auto:best">("auto");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const router = useRouter();
  const MAX_FILE_SIZE = 70 * 1024 * 1024;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("File size too large");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload directly to Cloudinary from browser
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      cloudinaryFormData.append("folder", "video-uploads");
      cloudinaryFormData.append("resource_type", "video");

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        cloudinaryFormData,
        {
          onUploadProgress: (event) => {
            if (!event.total) return;
            const percent = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(percent);
          },
        }
      );

      const { public_id, bytes, duration } = cloudinaryRes.data;

      // Step 2: Save metadata to your DB via API route
      await axios.post("/api/video-upload", {
        title,
        description,
        publicId: public_id,
        originalSize: file.size.toString(),
        compressedSize: String(bytes),
        duration: duration || 0,
      });

      router.push("/");
    } catch (error) {
      console.log(error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h1 className="card-title text-3xl">Upload & Compress a Video</h1>
          <p className="text-base-content/70">
            Choose a video file, add a title and description, and Cloudinary
            will automatically create a compressed version for your library.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label"><span className="label-text">Title</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full" required disabled={isUploading} />
            </div>
            <div>
              <label className="label"><span className="label-text">Description</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full" disabled={isUploading} />
            </div>
            <div>
              <label className="label"><span className="label-text">Output Quality</span></label>
              <select className="select select-bordered w-full" value={quality}
                onChange={(e) => setQuality(e.target.value as "auto" | "auto:eco" | "auto:good" | "auto:best")}
                disabled={isUploading}>
                <option value="auto">Auto (balanced)</option>
                <option value="auto:eco">Auto Eco (smaller size)</option>
                <option value="auto:good">Auto Good (higher quality)</option>
                <option value="auto:best">Auto Best (maximum quality)</option>
              </select>
              <p className="mt-1 text-xs text-base-content/60">
                This controls how aggressively Cloudinary compresses your video.
              </p>
            </div>
            <div>
              <label className="label"><span className="label-text">Video File</span></label>
              <input type="file" accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file-input file-input-bordered w-full" required disabled={isUploading} />
            </div>
            {isUploading && (
              <div className="space-y-2">
                <progress className="progress progress-primary w-full" value={uploadProgress} max={100} />
                <p className="text-sm text-base-content/70 text-center">Uploading... {uploadProgress}%</p>
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VideoUpload;