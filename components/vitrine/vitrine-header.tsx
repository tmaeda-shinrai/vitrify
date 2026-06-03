import Image from "next/image";
import { MessageCircle } from "lucide-react";

import { ShareButton } from "@/components/shared/share-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { clientEnv } from "@/lib/env";
import { formatWhatsappDisplay, vitrineTitle, type PublicVitrine } from "@/lib/vitrine";

/**
 * Cabeçalho da vitrine pública: capa (hero, LCP → `priority`), foto, nome/título,
 * subtítulo, bio e contato. Conteúdo é dado da dona — renderizado como texto (o
 * React já escapa). O botão "Pedir no WhatsApp" é #0013 (não entra aqui).
 */
export function VitrineHeader({ vitrine }: { vitrine: PublicVitrine }) {
  const { owner } = vitrine;
  const heading = vitrineTitle({ title: vitrine.title, ownerName: owner.fullName });
  const initial = (owner.fullName || heading).charAt(0).toUpperCase();
  const whatsapp = formatWhatsappDisplay(owner.whatsapp);
  const vitrineUrl = `${clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/${vitrine.slug}`;

  return (
    <header>
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary sm:h-56">
        {vitrine.heroImageUrl ? (
          <Image
            src={vitrine.heroImageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        ) : null}
        <ShareButton
          url={vitrineUrl}
          title={heading}
          size="icon"
          variant="secondary"
          className="absolute right-3 top-3 shadow-sm"
        />
      </div>

      <div className="mx-auto -mt-12 max-w-3xl px-4">
        <Avatar className="size-24 border-4 border-background shadow-md">
          {owner.avatarUrl ? <AvatarImage src={owner.avatarUrl} alt={owner.fullName} /> : null}
          <AvatarFallback className="bg-brand-primary/10 text-3xl font-semibold text-brand-primary">
            {initial}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">{heading}</h1>
        {vitrine.subtitle ? (
          <p className="mt-1 text-base text-muted-foreground">{vitrine.subtitle}</p>
        ) : null}
        {owner.bio ? (
          <p className="mt-3 max-w-prose whitespace-pre-line text-sm text-foreground/80">
            {owner.bio}
          </p>
        ) : null}
        {whatsapp ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MessageCircle className="size-4 text-whatsapp" aria-hidden />
            {whatsapp}
          </p>
        ) : null}
      </div>
    </header>
  );
}
