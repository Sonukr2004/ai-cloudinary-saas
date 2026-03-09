"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import VideoCard from "@/components/VideoCard";
import { Video } from "@/types";

function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingTitle, setDownloadingTitle] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const stats = useMemo(() => {
    if (videos.length === 0) {
      return {
        count: 0,
        savedBytes: 0,
      };
    }
    let saved = 0;
    videos.forEach((v) => {
      const original = Number((v as any).originalSize ?? 0);
      const compressed = Number((v as any).compressedSize ?? 0);
      if (original && compressed) {
        saved += Math.max(original - compressed, 0);
      }
    });
    return {
      count: videos.length,
      savedBytes: saved,
    };
  }, [videos]);

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const fetchVideos = useCallback(async () => {
    try {
      const response = await axios.get("/api/videos");
      if (Array.isArray(response.data)) {
        setVideos(response.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.log(error);
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDownload = useCallback(
    (url: string, title: string, fileExtension: string = "mp4") => {
      if (isDownloading) return;

      setIsDownloading(true);
      setDownloadingTitle(title || "video");
      setDownloadProgress(0);

      // Fetch the video and trigger a real file download (like images)
      (async () => {
        try {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error("Failed to download video");
          }

          // If we don't have a content-length header, fall back to simple blob download
          const contentLengthHeader = response.headers.get("content-length");

          let blob: Blob;

          if (!contentLengthHeader || !response.body) {
            blob = await response.blob();
          } else {
            const total = parseInt(contentLengthHeader, 10);
            const reader = response.body.getReader();
            const chunks: Uint8Array[] = [];
            let received = 0;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (!value) continue;

              chunks.push(value);
              received += value.length;

              if (total > 0) {
                const percent = Math.round((received / total) * 100);
                setDownloadProgress(percent);
              }
            }

            blob = new Blob(chunks);
          }

          const objectUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = objectUrl;
          link.download = `${title || "video"}.${fileExtension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.error("Video download failed", error);
          alert("Failed to download video. Please try again.");
        } finally {
          setIsDownloading(false);
          setDownloadingTitle(null);
          setDownloadProgress(null);
        }
      })();
    },
    [isDownloading]
  );

  const handleDelete = useCallback(
    async (id: string | number) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this video?"
      );
      if (!confirmed) return;

      try {
        const res = await fetch(`/api/videos/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to delete video");
        }
        setVideos((prev) => prev.filter((v: any) => v.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete video. Please try again.");
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-3 text-base-content/70">Loading your videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-error font-medium mb-2">{error}</p>
        <button className="btn btn-outline btn-sm" onClick={fetchVideos}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="card bg-base-100/90 shadow-xl backdrop-blur-sm">
        <div className="card-body md:flex md:items-center md:justify-between gap-4">
          <div>
            <h1 className="card-title text-3xl">Your Video Library</h1>
            <p className="text-base-content/70 mt-1">
              Browse all the videos you&apos;ve compressed with Cloudinary and
              download optimized versions anytime.
            </p>
            {isDownloading && downloadingTitle && (
              <div className="mt-3 space-y-1 text-sm text-base-content/80">
                <div className="flex items-center justify-between">
                  <span>Downloading "{downloadingTitle}"</span>
                  <span>{downloadProgress ?? 0}%</span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={downloadProgress ?? 0}
                  max={100}
                />
              </div>
            )}
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Videos</div>
              <div className="stat-value text-primary">
                {stats.count.toString()}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Space Saved</div>
              <div className="stat-value text-secondary text-lg">
                {formatBytes(stats.savedBytes)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="card bg-base-100 shadow-lg max-w-md w-full">
            <div className="card-body items-center text-center">
              <h2 className="card-title mb-2">No videos yet</h2>
              <p className="text-base-content/70 mb-4">
                Start by uploading a video from the <strong>Video Upload</strong>{" "}
                page to see it appear here with compression stats and a
                download link.
              </p>
              <div className="card-actions justify-center">
                <a href="/video-upload" className="btn btn-primary">
                  Go to Video Upload
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: any) => (
            <VideoCard
              key={video.id}
              video={video}
              onDownload={handleDownload}
              onDelete={() => handleDelete(video.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
