"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, Receipt, Share2 } from "lucide-react";

import { VideoEmbed } from "@/components/help/video-embed";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clientEnv } from "@/lib/env";

const FLAG_KEY = "vitrinio:welcome-tour:v1";

const TIPS = [
  {
    icon: Package,
    title: "Adicione seu primeiro produto",
    description: "Foto, nome e preço — pronto.",
    href: "/produtos?novo=1",
    cta: "Adicionar produto",
  },
  {
    icon: Share2,
    title: "Compartilhe sua vitrine",
    description: "Mande seu link para as clientes no WhatsApp e Instagram.",
    href: "/minha-vitrine",
    cta: "Ver minha vitrine",
  },
  {
    icon: Receipt,
    title: "Acompanhe seus pedidos",
    description: "Cada interesse pelo WhatsApp aparece na aba Pedidos.",
    href: "/pedidos",
    cta: "Ver pedidos",
  },
] as const;

/**
 * Card de boas-vindas no primeiro acesso (#0022): após o onboarding, o redirect leva
 * a `/produtos?bemvinda=1`. Mostra o vídeo intro + 3 dicas com CTAs, uma única vez
 * (flag no localStorage, padrão do `PlanWelcome`). Limpa o param da URL ao abrir.
 */
export function WelcomeTour() {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get("bemvinda") !== "1" || typeof window === "undefined") return;

    // Remove o param da URL independentemente de mostrar (evita reabrir no reload).
    const url = new URL(window.location.href);
    url.searchParams.delete("bemvinda");
    window.history.replaceState({}, "", url.toString());

    if (localStorage.getItem(FLAG_KEY)) return;
    localStorage.setItem(FLAG_KEY, "1");
    setOpen(true);
  }, [params]);

  const introVideoId = clientEnv.NEXT_PUBLIC_INTRO_VIDEO_ID ?? null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bem-vinda ao Vitrinio! 🎉</DialogTitle>
          <DialogDescription>
            Sua vitrine está no ar. Veja como dar os primeiros passos.
          </DialogDescription>
        </DialogHeader>

        <VideoEmbed youtubeId={introVideoId} title="Conheça o Vitrinio em 60 segundos" />

        <ul className="space-y-3">
          {TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <li key={tip.href} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{tip.title}</p>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link href={tip.href} onClick={() => setOpen(false)}>
                    {tip.cta}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>

        <DialogFooter className="sm:justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/ajuda" onClick={() => setOpen(false)}>
              Central de Ajuda
            </Link>
          </Button>
          <Button onClick={() => setOpen(false)}>Ver depois</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
