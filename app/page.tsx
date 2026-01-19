import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-zinc-900 mb-4">
          Task Manager
        </h1>
        <p className="text-xl text-zinc-600 mb-8">
          Organize your tasks efficiently with tags, search, and drag-and-drop prioritization
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
