"use client";

import React, { useState } from "react";

type AboutSection = "all" | "overview" | "video" | "images" | "auth";

export default function AboutPage() {
  const [active, setActive] = useState<AboutSection>("all");

  const isVisible = (section: AboutSection) =>
    active === "all" || active === section;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-900/40 via-base-100 to-purple-900/40 p-6 md:p-10">
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-secondary opacity-20 blur-3xl" />

      <div className="relative space-y-8">
        <div className="navbar rounded-2xl bg-base-100/80 shadow-lg backdrop-blur mb-2">
          <div className="flex-1">
            <span className="btn btn-ghost text-xl font-bold normal-case">
              About CloudCraft Studio
            </span>
          </div>
          <div className="flex-none">
            {/* MOBILE: dropdown */}
            <select
              className="select select-bordered select-sm sm:hidden"
              value={active}
              onChange={(e) => setActive(e.target.value as AboutSection)}
            >
              <option value="all">All</option>
              <option value="overview">Overview</option>
              <option value="video">Video</option>
              <option value="images">Images</option>
              <option value="auth">Auth</option>
            </select>

            {/* DESKTOP: original tabs */}
            <div className="tabs tabs-boxed hidden sm:flex">
              <button className={`tab ${active === "all" ? "tab-active" : ""}`} onClick={() => setActive("all")}>All</button>
              <button className={`tab ${active === "overview" ? "tab-active" : ""}`} onClick={() => setActive("overview")}>Overview</button>
              <button className={`tab ${active === "video" ? "tab-active" : ""}`} onClick={() => setActive("video")}>Video</button>
              <button className={`tab ${active === "images" ? "tab-active" : ""}`} onClick={() => setActive("images")}>Images</button>
              <button className={`tab ${active === "auth" ? "tab-active" : ""}`} onClick={() => setActive("auth")}>Auth</button>
            </div>
          </div>
        </div>

        <section
          id="overview"
          className={`card bg-base-100/90 shadow-xl backdrop-blur-sm hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${
            isVisible("overview") ? "block" : "hidden"
          }`}
        >
          <div className="card-body">
            <h2 className="card-title text-2xl">What this app does</h2>
            <p className="text-base-content/80">
              CloudCraft Studio is a mini SaaS where you can compress and
              manage videos, and create social-media ready images using
              Cloudinary&apos;s smart optimizations.
            </p>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section
            id="video"
            className={`card bg-gradient-to-br from-sky-500/20 via-base-100 to-sky-700/10 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${
              isVisible("video") ? "block" : "hidden"
            }`}
          >
            <div className="card-body">
              <h2 className="card-title">Smart Video Compression</h2>
              <p>
                Upload once on the <strong>Video Upload</strong> page and let
                Cloudinary automatically compress your videos while keeping good
                visual quality. The app tracks original vs. compressed size,
                duration, and upload time so you can see how much space you save.
              </p>
            </div>
          </section>

          <section
            className={`card bg-gradient-to-br from-emerald-500/20 via-base-100 to-emerald-700/10 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${
              isVisible("video") ? "block" : "hidden"
            }`}
          >
            <div className="card-body">
              <h2 className="card-title">Video Library</h2>
              <p>
                Explore everything you&apos;ve uploaded in the{" "}
                <strong>Home</strong> page. Each card shows a smart thumbnail, a
                hover preview clip, compression stats, and a download button for
                the optimized video.
              </p>
            </div>
          </section>

          <section
            id="images"
            className={`card bg-gradient-to-br from-fuchsia-500/25 via-base-100 to-fuchsia-700/10 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${
              isVisible("images") ? "block" : "hidden"
            }`}
          >
            <div className="card-body">
              <h2 className="card-title">Social Media Image Creator</h2>
              <p>
                On the <strong>Social Share</strong> page you can turn any image
                into ready-to-use posts and covers for Instagram, Twitter,
                Facebook, and LinkedIn. Choose the format, quality, filters, and
                add overlay text before downloading.
              </p>
            </div>
          </section>

          <section
            id="auth"
            className={`card bg-gradient-to-br from-indigo-500/25 via-base-100 to-indigo-800/10 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${
              isVisible("auth") ? "block" : "hidden"
            }`}
          >
            <div className="card-body">
              <h2 className="card-title">Secure Auth & Dashboard</h2>
              <p>
                Clerk handles sign up, login, and providers like Google or
                GitHub. After you authenticate, you land in a simple dashboard
                with navigation between video tools and the social image creator.
              </p>
            </div>
          </section>
        </div>

        <div className="alert alert-info mt-2 shadow-lg">
          <span>
            Start by uploading a video in <strong>Video Upload</strong>, review
            it in <strong>Home</strong>, then design a LinkedIn cover in{" "}
            <strong>Social Share</strong> to complete the workflow.
          </span>
        </div>
      </div>
    </div>
  );
}