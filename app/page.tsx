"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
}

export default function LandingPage() {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const idsRes = await fetch(
          "https://hacker-news.firebaseio.com/v0/topstories.json"
        );
        const ids: number[] = await idsRes.json();
        const shuffled = ids.sort(() => Math.random() - 0.5);
        const storyPromises = shuffled.slice(0, 6).map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
            (r) => r.json()
          )
        );
        const fetchedStories = await Promise.all(storyPromises);
        setStories(fetchedStories.filter((s) => s && s.title));
      } catch (error) {
        console.log("Failed to fetch news", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900/40 via-base-100 to-purple-900/40 flex flex-col items-center justify-center px-4 text-center">

      {/* Logo */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-primary-content flex items-center justify-center text-3xl font-extrabold shadow-lg mb-6">
        CS
      </div>

      {/* Heading */}
  

      <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 burning-text" style={{animation: "pulse 2s ease-in-out infinite"}}>
  CloudCraft Studio
</h1>
      <p className="text-base-content/70 text-lg max-w-xl mb-8">
        Compress videos, create social media images, and manage your media — all powered by Cloudinary AI.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link href="/sign-up" className="btn btn-primary btn-lg">
          Get Started Free
        </Link>
        <Link href="/sign-in" className="btn btn-outline btn-lg">
          Sign In
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mb-12">
        <div className="card bg-base-100/80 shadow-lg backdrop-blur">
          <div className="card-body items-center text-center p-4">
            <div className="text-3xl mb-2">🎬</div>
            <h2 className="font-bold">Video Compression</h2>
            <p className="text-sm text-base-content/60">Compress videos up to 70% smaller</p>
          </div>
        </div>
        <div className="card bg-base-100/80 shadow-lg backdrop-blur">
          <div className="card-body items-center text-center p-4">
            <div className="text-3xl mb-2">🖼️</div>
            <h2 className="font-bold">Social Media Images</h2>
            <p className="text-sm text-base-content/60">Resize for Instagram, Twitter & more</p>
          </div>
        </div>
        <div className="card bg-base-100/80 shadow-lg backdrop-blur">
          <div className="card-body items-center text-center p-4">
            <div className="text-3xl mb-2">🤖</div>
            <h2 className="font-bold">AI Chat</h2>
            <p className="text-sm text-base-content/60">Ask CloudCraft anything</p>
          </div>
        </div>
      </div>

      {/* HackerNews Live Feed */}
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4 text-left">
          🔥 Trending in Tech
        </h2>
        {loadingNews ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stories.map((story) => (
              <a
              
                key={story.id}
                href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card bg-base-100/80 shadow backdrop-blur hover:shadow-lg transition-all hover:-translate-y-1 text-left"
              >
                <div className="card-body p-4">
                  <p className="font-medium text-sm line-clamp-2">{story.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-base-content/50">
                    <span>⬆️ {story.score}</span>
                    <span>by {story.by}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-base-content/30 mt-8 mb-4">
        Powered by HackerNews • Updates on every visit
      </p>
    </div>
  );
}