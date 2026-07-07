import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding, buildBhajanEmbeddingText } from "@/lib/embeddings";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  // Only administrators can trigger the backfill
  const user = await requireRole("administrator");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Fetch bhajans that do not have an embedding yet (limit to 10 at a time to prevent timeout)
  const { data: bhajans, error: fetchError } = await supabase
    .from("bhajans")
    .select("*")
    .is("embedding", null)
    .limit(10);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!bhajans || bhajans.length === 0) {
    return NextResponse.json({ message: "No bhajans need backfilling." });
  }

  const results = [];
  for (const bhajan of bhajans) {
    try {
      const text = buildBhajanEmbeddingText({
        title: bhajan.title,
        category: bhajan.category,
        language: bhajan.language,
        tempo: bhajan.tempo,
        beatTaal: bhajan.beat_taal,
        lyrics: bhajan.lyrics,
        meaning: bhajan.meaning
      });

      const embeddingVector = await generateEmbedding(text);

      const { error: updateError } = await supabase
        .from("bhajans")
        .update({ embedding: embeddingVector })
        .eq("id", bhajan.id);

      if (updateError) {
        results.push({ id: bhajan.id, status: "error", message: updateError.message });
      } else {
        results.push({ id: bhajan.id, status: "success" });
      }
    } catch (e: any) {
      results.push({ id: bhajan.id, status: "error", message: e.message });
    }
  }

  return NextResponse.json({
    message: `Processed ${bhajans.length} bhajans.`,
    results
  });
}
