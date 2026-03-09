"use client"

import React, {useState, useEffect, useRef, useMemo} from 'react'
import { CldImage } from 'next-cloudinary';

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
  // LinkedIn recommended cover size ~1584 x 396 (4:1)
  "LinkedIn Cover (4:1)": { width: 1584, height: 396, aspectRatio: "4:1" },
};

  type SocialFormat = keyof typeof socialFormats;

  export default function SocialShare() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("Instagram Square (1:1)");
    const [isUploading, setIsUploading] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [quality, setQuality] = useState<"auto" | "auto:eco" | "auto:good" | "auto:best">("auto");
    const [effect, setEffect] = useState<"none" | "grayscale" | "blur" | "cartoonify" | "vignette">("none");
    const [overlayText, setOverlayText] = useState("");
    const [removeBackground, setRemoveBackground] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);


    useEffect(() => {
      if (uploadedImage) {
        setIsTransforming(true);
      }
    }, [selectedFormat, uploadedImage, quality, effect, overlayText, removeBackground]);

    const rawTransformations = useMemo(() => {
      const transforms: string[] = [];

      // Background removal (Cloudinary AI)
      if (removeBackground) {
        transforms.push("e_background_removal");
        transforms.push("f_png");
      }

      // Quality (Cloudinary q_ transformation)
      transforms.push(`q_${quality}`);

      // Simple effects
      if (effect === "grayscale") {
        transforms.push("e_grayscale");
      } else if (effect === "blur") {
        transforms.push("e_blur:200");
      } else if (effect === "cartoonify") {
        transforms.push("e_cartoonify");
      } else if (effect === "vignette") {
        transforms.push("e_vignette:60");
      }

      // Text overlay at the bottom center
      const text = overlayText.trim();
      if (text) {
        const encoded = encodeURIComponent(text);
        transforms.push(
          // Use a common font so it always renders, with white text and slight offset
          `l_text:Arial_48:${encoded},co_white,g_south,y_40`
        );
      }

      return transforms;
    }, [quality, effect, overlayText, removeBackground]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/image-upload", {
                method: "POST",
                body: formData
            })

            if(!response.ok) throw new Error("Failed to upload image");

            const data = await response.json();
            setUploadedImage(data.publicId);


        } catch (error) {
            console.log(error)
            alert("Failed to upload image");
        } finally{
            setIsUploading(false);
        }
    };

    const handleDownload = () => {
        if(!imageRef.current) return;

        fetch(imageRef.current.src)
        .then((response) => response.blob())
        .then((blob) => {
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a");
            link.href = url;
            link.download = `${selectedFormat
          .replace(/\s+/g, "_")
          .toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
    }


    return (
        <div className="container mx-auto p-4 max-w-4xl space-y-4">
          <div className="card bg-base-100/90 shadow-xl">
            <div className="card-body text-center">
              <h1 className="card-title text-3xl justify-center">
                Social Media Image Creator
              </h1>
              <p className="text-base-content/70">
                Upload an image once, then generate perfectly sized covers and posts
                for Instagram, Twitter, Facebook and LinkedIn using Cloudinary.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Upload an Image</h2>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Choose an image file</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="file-input file-input-bordered file-input-primary w-full"
                />
              </div>

              {isUploading && (
                <div className="mt-4">
                  <progress className="progress progress-primary w-full"></progress>
                </div>
              )}

              {uploadedImage && (
                <div className="mt-6">
                  <h2 className="card-title mb-4">Select Social Media Format</h2>
                  <div className="form-control">
                    <select
                      className="select select-bordered w-full"
                      value={selectedFormat}
                      onChange={(e) =>
                        setSelectedFormat(e.target.value as SocialFormat)
                      }
                    >
                      {Object.keys(socialFormats).map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Quality</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={quality}
                        onChange={(e) =>
                          setQuality(e.target.value as typeof quality)
                        }
                      >
                        <option value="auto">Auto</option>
                        <option value="auto:eco">Auto Eco (smaller)</option>
                        <option value="auto:good">Auto Good</option>
                        <option value="auto:best">Auto Best</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Effect</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={effect}
                        onChange={(e) =>
                          setEffect(e.target.value as typeof effect)
                        }
                      >
                        <option value="none">None</option>
                        <option value="grayscale">Grayscale</option>
                        <option value="blur">Blur</option>
                        <option value="cartoonify">Cartoonify</option>
                        <option value="vignette">Vignette</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Overlay text</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Add a title on the image"
                        value={overlayText}
                        onChange={(e) => setOverlayText(e.target.value)}
                      />
                    </div>

                    <div className="form-control md:col-span-3">
                      <label className="label cursor-pointer justify-between">
                        <span className="label-text">Remove background</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={removeBackground}
                          onChange={(e) => setRemoveBackground(e.target.checked)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 relative">
                    <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                    <div className="flex justify-center">
                      {isTransforming && (
                        <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                          <span className="loading loading-spinner loading-lg"></span>
                        </div>
                      )}
                      <CldImage
                        width={socialFormats[selectedFormat].width}
                        height={socialFormats[selectedFormat].height}
                        src={uploadedImage}
                        sizes="100vw"
                        alt="transformed image"
                        crop="fill"
                        aspectRatio={socialFormats[selectedFormat].aspectRatio}
                        gravity="auto"
                        rawTransformations={rawTransformations}
                        ref={imageRef}
                        onLoad={() => setIsTransforming(false)}
                      />
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-6">
                    <button className="btn btn-primary" onClick={handleDownload}>
                      Download for {selectedFormat}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
}
