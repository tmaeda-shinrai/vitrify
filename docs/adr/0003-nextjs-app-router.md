# ADR-003: Next.js 14 com App Router (em vez de Pages Router)

## Status

Aceito (MVP).

## Contexto

Queríamos um único framework para frontend e backend (menos contexto a aprender),
Server Components para reduzir JavaScript no cliente (público em dispositivos modestos)
e ISR para as vitrines públicas. A escolha era entre App Router (novo, RSC) e Pages
Router (maduro, porém sem RSC e com ISR no modelo antigo).

## Decisão

Adotar **Next.js 14 com App Router**: Server Components por padrão, Route Handlers para
a API, três route groups (`(auth)`, `(dashboard)`, `(public)`), e Server Actions para
mutações que alteram estado.

## Consequências

- (+) RSC reduzem o JS enviado ao cliente; `"use client"` só onde necessário.
- (+) Mesmo framework para UI e backend; deploy integrado na Vercel.
- (+) ISR de 1ª classe para a vitrine pública (ver ADR-005).
- (+) Server Actions simplificam mutações sem montar uma API REST completa.
- (−) App Router era relativamente novo: menos material e algumas arestas (cache,
  `setRequestLocale` para render estático/ISR, divergências de libs).
- (−) Curva de aprendizado de RSC vs. componentes clássicos.
