import { NextResponse } from "next/server"
import axios from "axios"
import cheerio from "cheerio"
import youtubedl from "youtube-dl-exec"

interface VideoInfo {
  url?: string
  title?: string
  error?: string
}

export async function POST(req: Request) {
  const { url } = await req.json()

  try {
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    let videoInfo: VideoInfo = {}

    if (url.match(/youtube\.com|youtu\.be/)) {
      videoInfo = (await youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
      })) as VideoInfo
    } else if (url.includes("tiktok.com")) {
      const response = await axios.get(url)
      const $ = cheerio.load(response.data)
      videoInfo.url = $('meta[property="og:video"]').attr("content") || ""
    } else if (url.match(/twitter\.com|x\.com/)) {
      const response = await axios.get(`https://twdown.net/download.php`, { params: { url } })
      const $ = cheerio.load(response.data)
      videoInfo.url = $(".download-link:first-child a").attr("href") || ""
    } else if (url.includes("instagram.com")) {
      const response = await axios.get(url)
      const $ = cheerio.load(response.data)
      videoInfo.url = $('meta[property="og:video"]').attr("content") || ""
    } else if (url.includes("facebook.com")) {
      // Facebook download logic (this is a placeholder and may not work)
      const response = await axios.get(url)
      const $ = cheerio.load(response.data)
      videoInfo.url = $('meta[property="og:video"]').attr("content") || ""
    }

    if (!videoInfo.url) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Video information retrieved successfully",
      downloadUrl: videoInfo.url,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Failed to fetch video information" }, { status: 500 })
  }
}

