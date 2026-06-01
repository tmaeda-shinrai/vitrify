-- Migration: seed de marcas sugeridas (dado de referência, todas as envs).
-- Alimenta o autocomplete de marcas no cadastro de produtos.
-- Idempotente: re-execução não duplica (ON CONFLICT (name) DO NOTHING).

INSERT INTO suggested_brands (name) VALUES
  ('Avon'),
  ('Natura'),
  ('O Boticário'),
  ('Eudora'),
  ('Quem Disse, Berenice?'),
  ('Mary Kay'),
  ('Hinode'),
  ('Jequiti'),
  ('Racco'),
  ('Abelha Rainha'),
  ('Tupperware'),
  ('Polishop'),
  ('Yes Cosmetics'),
  ('Demillus'),
  ('Ésika'),
  ('L''Bel'),
  ('Cyzone'),
  ('Herbalife'),
  ('Forever Living'),
  ('Up! Essência'),
  ('Água de Cheiro'),
  ('Boni Natural')
ON CONFLICT (name) DO NOTHING;
