"use client"
import { Github, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-white/5 backdrop-blur-xl mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full">
              <img
                src="https://avatars.githubusercontent.com/u/134331217?v=4"
                alt="Creator avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm text-white/60">
              Created with ♥️ by <span className="font-semibold text-white">Pratham</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/prathamdby"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://x.com/prathamdby"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="sr-only">X (Twitter)</span>
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com/in/prathamdby"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

