import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import youtubedl from "youtube-dl-exec";

interface VideoInfo {
  url?: string;
  title?: string;
  error?: string;
}

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    let videoInfo: VideoInfo = {};

    if (url.match(/youtube\.com|youtu\.be/)) {
      /**
       * YouTube Legal Restrictions:
       * - Terms of Service Section 5.B: Prohibits downloading without permission
       * - Only allowed if download button is implemented by YouTube itself
       * - Scraping violates ToS
       */
      videoInfo = (await youtubedl(url, {
        dumpSingleJson: false,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        // audioFormat: 'mp3',
        //audioQuality: 0,
        youtubeSkipDashManifest: true,
        referer: "https://google.com",
        // addHeader: ["referer:youtube.com", "user-agent:googlebot"],
      })) as VideoInfo;
      console.log(videoInfo);
    } else if (url.includes("tiktok.com")) {
      /**
       * TikTok Legal Restrictions:
       * - Terms of Service Section 2.B: Users grant limited license
       * - Downloading requires explicit consent from content owner
       * - Commercial use prohibited without permission
       */
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      videoInfo.url = $('meta[property="og:video"]').attr("content") || "";
    } else if (url.match(/twitter\.com|x\.com/)) {
      /**
       * Twitter/X Legal Restrictions:
       * - Developer Agreement Section II.A: Prohibits unauthorized access
       * - Content scraping violates ToS
       * - Requires API use with proper authorization
       */
      const response = await axios.get(`https://twdown.net/download.php`, {
        params: { url },
      });
      const $ = cheerio.load(response.data);
      videoInfo.url = $(".download-link:first-child a").attr("href") || "";
    } else if (url.includes("instagram.com")) {
      /**
       * Instagram Legal Restrictions:
       * - Terms of Use Section 4: Prohibits unauthorized data collection
       * - Downloading private content is illegal
       * - Requires explicit user consent for public content
       */
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      videoInfo.url = $('meta[property="og:video"]').attr("content") || "";
    } else if (url.includes("facebook.com")) {
      // Facebook download logic (this is a placeholder and may not work)
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      videoInfo.url = $('meta[property="og:video"]').attr("content") || "";
    }

    if (!videoInfo.url) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Video information retrieved successfully",
      downloadUrl: videoInfo.url,
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video information" },
      { status: 500 }
    );
  }
}
