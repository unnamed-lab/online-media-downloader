"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Youtube, Instagram, Twitter, Facebook } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [url, setUrl] = useState("")
  const [platform, setPlatform] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { success: boolean; message: string; downloadUrl?: string }>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  useEffect(() => {
    if (url) {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        setPlatform("youtube")
      } else if (url.includes("instagram.com")) {
        setPlatform("instagram")
      } else if (url.includes("tiktok.com")) {
        setPlatform("tiktok")
      } else if (url.includes("twitter.com") || url.includes("x.com")) {
        setPlatform("twitter")
      } else if (url.includes("facebook.com")) {
        setPlatform("facebook")
      } else {
        setPlatform("")
      }
    }
  }, [url])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-100 to-white">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Social Media Downloader</CardTitle>
          <CardDescription className="text-center">
            Download content from YouTube, Instagram, TikTok, Twitter, and Facebook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="url"
              placeholder="Enter URL here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full"
            />
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                onClick={() => setPlatform("youtube")}
                variant={platform === "youtube" ? "default" : "outline"}
              >
                <Youtube className="mr-2 h-4 w-4" /> YouTube
              </Button>
              <Button
                type="button"
                onClick={() => setPlatform("instagram")}
                variant={platform === "instagram" ? "default" : "outline"}
              >
                <Instagram className="mr-2 h-4 w-4" /> Instagram
              </Button>
              <Button
                type="button"
                onClick={() => setPlatform("tiktok")}
                variant={platform === "tiktok" ? "default" : "outline"}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>{" "}
                TikTok
              </Button>
              <Button
                type="button"
                onClick={() => setPlatform("twitter")}
                variant={platform === "twitter" ? "default" : "outline"}
              >
                <Twitter className="mr-2 h-4 w-4" /> Twitter
              </Button>
              <Button
                type="button"
                onClick={() => setPlatform("facebook")}
                variant={platform === "facebook" ? "default" : "outline"}
              >
                <Facebook className="mr-2 h-4 w-4" /> Facebook
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={!url || !platform || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Download"
              )}
            </Button>
          </form>
          {result && (
            <div
              className={`mt-4 p-4 rounded-md ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              <p>{result.message}</p>
              {result.success && result.downloadUrl && (
                <Button asChild className="mt-2">
                  <a href={result.downloadUrl} download>
                    Download File
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Legal Disclaimer</h2>
            <p className="mb-4">
              This tool is intended for educational purposes only. Downloading copyrighted content without permission
              may violate:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>YouTube Terms of Service (Section 5.B)</li>
              <li>Instagram Terms of Use (Section 4)</li>
              <li>TikTok Terms of Service (Section 2.B)</li>
              <li>Twitter/X Developer Agreement (Section II.A)</li>
            </ul>
            <p className="mb-4">
              By using this service, you agree that you will only download content you have explicit rights to access
              and distribute.
            </p>
            <Button onClick={() => setShowDisclaimer(false)} className="w-full">
              I Understand
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}

