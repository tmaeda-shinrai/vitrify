-- Migration: bucket de imagens de produtos + políticas de Storage — #0010
-- Referência: docs/ARCHITECTURE.md §5.1 (upload) e §6.5 (MIME/SVG), DESIGN §2.6.
--
-- Bucket público `products` (as fotos aparecem na vitrine pública). Limite de 1 MB,
-- só imagens raster (sem SVG — vetor de XSS). O upload é feito via signed URL; as
-- políticas restringem escrita à pasta da própria usuária (`<uid>/...`). Espelha o
-- bucket `avatars` da #0009.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  TRUE,
  1048576, -- 1 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública das imagens do bucket.
CREATE POLICY "products_public_read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'products');

-- Escrita (insert/update/delete) só na própria pasta: products/<uid>/arquivo.
CREATE POLICY "products_owner_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "products_owner_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "products_owner_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );
