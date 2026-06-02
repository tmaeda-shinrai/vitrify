-- Migration: bucket de avatars + políticas de Storage — #0009
-- Referência: docs/ARCHITECTURE.md §5.1 (upload) e §6.5 (MIME/SVG).
--
-- Bucket público `avatars` (a foto aparece na vitrine pública). Limite de 512KB,
-- só imagens raster (sem SVG — vetor de XSS). O upload é feito via signed URL; as
-- políticas abaixo restringem escrita à pasta do próprio usuário (`<uid>/...`).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  524288, -- 512 KB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública das imagens do bucket.
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

-- Escrita (insert/update/delete) só na própria pasta: avatars/<uid>/arquivo.
CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );
