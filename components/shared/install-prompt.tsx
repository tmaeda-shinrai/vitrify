"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { clientEnv } from "@/lib/env";

// Evento não-padrão do Chrome/Android; não está no lib.dom do TS.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "vitrinio:install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Affordance discreta de "instalar app" (#0017). No Android/Chrome captura
 * `beforeinstallprompt` e oferece o botão nativo; no iOS Safari mostra as
 * instruções de "Adicionar à Tela de Início". Dispensável (lembra via
 * localStorage) e nunca aparece quando já instalado (standalone).
 */
export function InstallPrompt() {
  const t = useTranslations("pwa");
  const appName = clientEnv.NEXT_PUBLIC_APP_NAME;
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    setDismissed(false);

    if (isIos()) {
      setShowIos(true);
      return;
    }

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferred(null);
      setDismissed(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setDismissed(true);
  }

  // Nada a mostrar: instalado, dispensado ou Android ainda sem o evento nativo.
  if (dismissed) return null;
  if (!showIos && !deferred) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-lg border border-border bg-background p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:mx-0">
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <p className="pr-6 font-display text-sm font-semibold">{t("installTitle", { appName })}</p>
      {showIos ? (
        <p className="mt-1 text-sm text-muted-foreground">{t("iosInstructions")}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">{t("installDescription")}</p>
          <Button size="sm" className="mt-3 w-full" onClick={handleInstall}>
            <Download className="size-4" />
            {t("install")}
          </Button>
        </>
      )}
    </div>
  );
}
