import { NextResponse } from "next/server";
import { importFromSaiRhythms } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // 1. Verify cron secret to prevent unauthorized scraping
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const secretParams = url.searchParams.get("secret");

  const expectedSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, require it either via Bearer token or query param
  if (expectedSecret) {
    if (authHeader !== `Bearer ${expectedSecret}` && secretParams !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 2. Fetch the SaiRhythms RSS feed for the latest songs
    const rssRes = await fetch("https://sairhythms.sathyasai.org/rss.xml", {
      headers: {
        "User-Agent": "VancouverSaiCentre-Scrubber/1.0",
        "Accept": "application/xml"
      },
      next: { revalidate: 0 }
    });

    if (!rssRes.ok) {
      throw new Error(`Failed to fetch RSS: ${rssRes.status}`);
    }

    const xml = await rssRes.text();

    // Extract song URLs from the XML
    // RSS format has <link>https://sairhythms.sathyasai.org/song/...</link>
    const links: string[] = [];
    const linkMatches = xml.matchAll(/<link>(https:\/\/sairhythms\.sathyasai\.org\/song\/[^<]+)<\/link>/gi);
    for (const match of linkMatches) {
      if (!links.includes(match[1])) {
        links.push(match[1]);
      }
    }

    if (links.length === 0) {
      return NextResponse.json({ message: "No song links found in RSS." });
    }

    const supabase = await createClient();
    const results = [];
    let addedCount = 0;

    // 3. Process up to 5 newest songs to avoid overloading the API / timeouts
    const urlsToProcess = links.slice(0, 5);

    for (const url of urlsToProcess) {
      // Check if we already have this source link
      const { data: existing } = await supabase
        .from("bhajans")
        .select("id")
        .eq("source_link", url)
        .maybeSingle();

      if (existing) {
        results.push({ url, status: "skipped", reason: "Already exists" });
        continue;
      }

      // Import the new song
      try {
        const importRes = await importFromSaiRhythms(url);
        
        if (importRes.ok && importRes.data && importRes.data.length > 0) {
          // It might return multiple versions, insert them as pending
          for (const version of importRes.data) {
            const row = {
              title: version.title,
              lyrics: version.lyrics,
              meaning: version.meaning,
              tempo: version.tempo,
              beat_taal: version.beatTaal,
              language: version.language,
              category: version.category,
              notes: version.notes,
              source_link: version.sourceLink || url,
              audio_url: version.audioUrl || null,
              video_url: version.videoUrl || null,
              status: "pending", // Let admins review before making public
              created_by: null // System generated
            };
            
            const { error: insertError } = await supabase.from("bhajans").insert(row);
            
            if (insertError) {
              results.push({ url, status: "error", error: insertError.message });
            } else {
              addedCount++;
            }
          }
          if (!results.find(r => r.url === url)) {
            results.push({ url, status: "success", count: importRes.data.length });
          }
        } else {
          results.push({ url, status: "failed", error: importRes.message });
        }
      } catch (err: any) {
        results.push({ url, status: "error", error: err.message });
      }
    }

    return NextResponse.json({
      message: `Scrubbing complete. Added ${addedCount} new bhajans.`,
      results
    });

  } catch (error: any) {
    console.error("Scrubber Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
