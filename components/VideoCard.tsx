import React, {useState, useEffect, useCallback} from 'react'
import {getCldImageUrl, getCldVideoUrl} from "next-cloudinary"
import { Download, Clock, FileDown, FileUp, Trash2 } from "lucide-react";
import dayjs from 'dayjs';
import realtiveTime from "dayjs/plugin/relativeTime"
import {filesize} from "filesize"
import { Video } from '@/types';

dayjs.extend(realtiveTime)

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string, fileExtension?: string) => void;
    onDelete?: () => void;
}

const  VideoCard: React.FC<VideoCardProps> = ({video, onDownload, onDelete}) => {
    const [isHovered, setIsHovered] = useState(false)
    const [previewError, setPreviewError] = useState(false)
    const [selectedResolution, setSelectedResolution] = useState<"original" | "4k" | "1080p" | "720p">("1080p");
    const [watermarkEnabled, setWatermarkEnabled] = useState(false);

    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: "limit",
            gravity: "auto",
            format: "jpg",
            quality: "auto",
            assetType: "video"
        })
    }, [])

    const getKeyframeThumbnailUrl = useCallback(
      (
        publicId: string,
        position: "start" | "middle" | "end"
      ) => {
        const rawTransformations: string[] = [];

        if (position === "start") {
          rawTransformations.push("so_0");
        } else if (position === "middle") {
          rawTransformations.push("so_50p");
        } else {
          rawTransformations.push("so_90p");
        }

        return getCldImageUrl({
          src: publicId,
          width: 120,
          height: 68,
          crop: "limit",
          gravity: "auto",
          format: "jpg",
          quality: "auto",
          assetType: "video",
          rawTransformations,
        });
      },
      []
    );

    const getFullVideoUrl = useCallback(
      (
        publicId: string,
        options?: {
          resolution?: "original" | "4k" | "1080p" | "720p";
          watermark?: boolean;
        }
      ) => {
        const resolution = options?.resolution ?? "1080p";

        let width: number | undefined;
        let height: number | undefined;

        if (resolution === "4k") {
          width = 3840;
          height = 2160;
        } else if (resolution === "1080p") {
          width = 1920;
          height = 1080;
        } else if (resolution === "720p") {
          width = 1280;
          height = 720;
        }

        const baseOptions: any = {
          src: publicId,
          assetType: "video",
        };

        if (width && height) {
          baseOptions.width = width;
          baseOptions.height = height;
          baseOptions.crop = "limit";
        } else {
          // When user chooses "Original" resolution, still serve a compressed stream
          // at the original dimensions using a more aggressive quality.
          baseOptions.quality = "auto:eco";
        }

        const rawTransformations: string[] = [];

        if (options?.watermark) {
          // Text watermark with your brand "CS" in the bottom-right corner
          rawTransformations.push(
            "l_text:Arial_40:CS,co_white,g_south_east,x_20,y_20,o_80"
          );
        }

        if (rawTransformations.length > 0) {
          baseOptions.rawTransformations = rawTransformations;
        }

        return getCldVideoUrl(baseOptions);
      },
      []
    )

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
          src: publicId,
          width: 400,
          height: 225,
          assetType: "video",
          crop: "limit",
          quality: "auto:eco",
          // short 5s clip from the start for hover preview
          rawTransformations: ["so_0", "du_5"],
        });
      }, []);

    const getGifOrClipUrl = useCallback(
      (publicId: string, format: "gif" | "mp4") => {
        if (format === "gif") {
          return getCldVideoUrl({
            src: publicId,
            assetType: "video",
            format: "gif",
            rawTransformations: ["so_2", "du_3", "e_loop:2"],
          });
        }

        // tiny MP4 clip
        return getCldVideoUrl({
          src: publicId,
          assetType: "video",
          width: 480,
          height: 270,
          crop: "limit",
          quality: "auto:eco",
          rawTransformations: ["so_2", "du_3"],
        });
      },
      []
    );

    const formatSize = useCallback((size: number) => {
        return filesize(size)
    }, [])

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      }, []);

      const compressionPercentage = (() => {
        const original = Number(video.originalSize);
        const compressed = Number(video.compressedSize);

        if (!original || !compressed || original <= 0) {
          return 0;
        }

        const saved = Math.max(original - compressed, 0);
        const percent = Math.round((saved / original) * 100);

        return Math.max(percent, 0);
      })();

      useEffect(() => {
        setPreviewError(false);
      }, [isHovered]);

      const handlePreviewError = () => {
        setPreviewError(true);
      };

      return (
        <div
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <figure className="aspect-video relative">
            {isHovered ? (
              previewError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <p className="text-red-500">Preview not available</p>
                </div>
              ) : (
                <video
                  src={getPreviewVideoUrl(video.publicId)}
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-contain bg-black"
                  onError={handlePreviewError}
                />
              )
            ) : (
              <img
              src={getThumbnailUrl(video.publicId)}
              alt={video.title}
              className="w-full h-full object-contain bg-black"
            />
            )}
            <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
              <Clock size={16} className="mr-1" />
              {formatDuration(video.duration)}
            </div>
          </figure>
          <div className="card-body p-4">
            <h2 className="card-title text-lg font-bold">{video.title}</h2>
            <p className="text-sm text-base-content opacity-70 mb-4">
              {video.description}
            </p>
            <p className="text-sm text-base-content opacity-70 mb-4">
              Uploaded {dayjs(video.createdAt).fromNow()}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <FileUp size={18} className="mr-2 text-primary" />
                <div>
                  <div className="font-semibold">Original</div>
                  <div>{formatSize(Number(video.originalSize))}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FileDown size={18} className="mr-2 text-secondary" />
                <div>
                  <div className="font-semibold">Compressed</div>
                  <div>{formatSize(Number(video.compressedSize))}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-base-content/70">
                Keyframes
              </span>
              <div className="flex gap-2">
                <img
                  src={getKeyframeThumbnailUrl(video.publicId, "start")}
                  alt={`${video.title} start frame`}
                  className="w-20 h-12 object-cover rounded-md"
                />
                <img
                  src={getKeyframeThumbnailUrl(video.publicId, "middle")}
                  alt={`${video.title} middle frame`}
                  className="w-20 h-12 object-cover rounded-md"
                />
                <img
                  src={getKeyframeThumbnailUrl(video.publicId, "end")}
                  alt={`${video.title} end frame`}
                  className="w-20 h-12 object-cover rounded-md"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex justify-between items-center gap-3">
                <div className="text-sm font-semibold">
                  Compression:{" "}
                  <span className="text-accent">{compressionPercentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="label cursor-pointer gap-2">
                    <span className="label-text text-xs">Watermark</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={watermarkEnabled}
                      onChange={(e) => setWatermarkEnabled(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Resolution</span>
                  <select
                    className="select select-bordered select-xs"
                    value={selectedResolution}
                    onChange={(e) =>
                      setSelectedResolution(
                        e.target.value as "original" | "4k" | "1080p" | "720p"
                      )
                    }
                  >
                    <option value="original">Original</option>
                    <option value="4k">4K</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      onDownload(
                        getFullVideoUrl(video.publicId, {
                          resolution: selectedResolution,
                          watermark: watermarkEnabled,
                        }),
                        video.title,
                        "mp4"
                      )
                    }
                  >
                    <Download size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    title="Download short MP4 clip"
                    onClick={() =>
                      onDownload(
                        getGifOrClipUrl(video.publicId, "mp4"),
                        `${video.title}-clip`,
                        "mp4"
                      )
                    }
                  >
                    Clip
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    title="Download as GIF"
                    onClick={() =>
                      onDownload(
                        getGifOrClipUrl(video.publicId, "gif"),
                        `${video.title}-gif`,
                        "gif"
                      )
                    }
                  >
                    GIF
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-error btn-sm"
                      onClick={onDelete}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}

export default VideoCard
