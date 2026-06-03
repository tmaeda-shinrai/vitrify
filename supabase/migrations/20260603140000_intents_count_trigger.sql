-- Migration: contador de intenções por produto — #0015
-- Referência: docs/DATABASE.md §2.5/§2.7.
--
-- Cada INSERT em order_intents (clique no botão "Pedir no WhatsApp") soma +1 em
-- products.intents_count quando há produto. SECURITY DEFINER para rodar acima da
-- RLS (o INSERT é feito pelo cliente anônimo, que não pode dar UPDATE em products).

CREATE OR REPLACE FUNCTION bump_product_intents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products
    SET intents_count = COALESCE(intents_count, 0) + 1
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_product_intents
  AFTER INSERT ON order_intents
  FOR EACH ROW EXECUTE FUNCTION bump_product_intents();
