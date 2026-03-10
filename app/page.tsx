import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900/40 via-base-100 to-purple-900/40 flex flex-col items-center justify-center px-4 text-center">
      
      {/* Logo */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-primary-content flex items-center justify-center text-3xl font-extrabold shadow-lg mb-6">
        CS
      </div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 burning-text">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
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
    </div>
  );
}