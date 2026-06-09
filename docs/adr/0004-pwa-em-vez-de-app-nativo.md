# ADR-004: PWA em vez de app nativo

## Status

Aceito (MVP).

## Contexto

O público são revendedoras de venda direta; o caso de uso (montar uma vitrine,
compartilhar link, receber pedidos via WhatsApp) não exige hardware específico nem
recursos profundos de câmera. Precisávamos de tempo de desenvolvimento curto e
atualizações rápidas, sem custo de manter apps nativos em duas lojas.

## Decisão

Entregar uma **PWA instalável** (Next.js + service worker via Serwist), com manifest,
ícones, atalhos e fallback offline, instalável tanto no Android quanto no iOS. App
nativo fica no roadmap pós-PMF, se houver demanda real.

## Consequências

- (+) Uma única codebase web; atualizações instantâneas sem aprovação de loja.
- (+) Instalável nos dois sistemas; suficiente para o caso de uso.
- (+) Reuso direto da stack web (Next/Vercel), sem pipeline mobile.
- (−) Limitações de PWA no iOS (push/instalação menos integrados que no Android).
- (−) Sem acesso a APIs nativas profundas (aceitável para o escopo atual).
- (−) Service worker exige cuidado com cache/versionamento (mitigado pelo Serwist).
