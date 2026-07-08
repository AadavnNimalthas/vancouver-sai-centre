-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector with schema extensions;

-- Add a vector column to the bhajans table for storing local embeddings
alter table public.bhajans add column if not exists embedding vector(384);

-- Create an HNSW index for fast semantic search over embeddings
create index if not exists bhajans_embedding_hnsw_idx 
  on public.bhajans 
  using hnsw (embedding vector_cosine_ops);

-- Create a Postgres function that performs cosine similarity search
create or replace function match_bhajans (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  lyrics text,
  meaning text,
  similarity float
)
language sql stable
as $$
  select
    bhajans.id,
    bhajans.title,
    bhajans.lyrics,
    bhajans.meaning,
    1 - (bhajans.embedding <=> query_embedding) as similarity
  from public.bhajans
  where 1 - (bhajans.embedding <=> query_embedding) > match_threshold
  order by bhajans.embedding <=> query_embedding
  limit match_count;
$$;
