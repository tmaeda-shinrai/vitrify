import { AlertTriangle } from "lucide-react";

/**
 * Aviso de que o documento legal é um draft pendente de revisão jurídica (#0021).
 * Some quando os textos forem validados por advogado (pré-lançamento, `docs/LEGAL.md` §8).
 */
export function LegalDocBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        <strong>Documento em revisão.</strong> Este é um rascunho ainda pendente de revisão por
        advogado especializado. Pode mudar antes do lançamento.
      </p>
    </div>
  );
}
