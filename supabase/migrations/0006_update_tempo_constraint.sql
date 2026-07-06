-- Drop the existing check constraint on tempo column
ALTER TABLE public.bhajans DROP CONSTRAINT IF EXISTS bhajans_tempo_check;

-- Add the updated check constraint supporting the new tempos
ALTER TABLE public.bhajans ADD CONSTRAINT bhajans_tempo_check CHECK (tempo IN ('meliodic', 'slow', 'medium', 'fast', 'very_fast'));
