import { AlertCircle } from "lucide-react";

/** Mensagem de erro abaixo do campo, em vermelho com ícone (DESIGN §4.3). */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-sm text-destructive" role="alert">
      <AlertCircle className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}
