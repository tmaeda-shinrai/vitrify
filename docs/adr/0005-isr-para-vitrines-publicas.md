# ADR-005: ISR para as vitrines públicas

## Status

Aceito (MVP).

## Contexto

A vitrine pública (`/[slug]`) é a página mais acessada e compartilhada; precisa ser
**rápida** (clientes em redes móveis) e **barata** (alto volume de leitura, pouca
escrita). O conteúdo muda apenas quando a dona edita produtos. Renderizar no servidor a
cada request seria caro e lento; estático puro não refletiria edições.

## Decisão

Renderizar a vitrine como **Server Component com ISR** (`revalidate = 60`) +
`generateStaticParams` para as vitrines ativas. As edições de produto chamam
`revalidatePath('/<slug>')` para invalidação sob demanda. A leitura usa clients **sem
cookies** (anon + admin para o perfil), mantendo a rota elegível a cache estático/ISR
(`setRequestLocale` no root layout habilita o render estático).

## Consequências

- (+) Vitrine rápida como página estática, servida da CDN.
- (+) Custo de leitura baixo (poucas regenerações; sem render por request).
- (+) Edições aparecem rápido via `revalidatePath` (sem esperar a janela de 60s).
- (−) Janela de defasagem de até 60s quando a invalidação sob demanda não dispara.
- (−) A leitura precisa evitar cookies/headers dinâmicos para não "optar para fora" do
  cache — exige disciplina (clients dedicados, `setRequestLocale`).
- (−) Busca/filtros da vitrine são client-side sobre os dados já carregados (full-text
  no Postgres fica como otimização futura) para preservar o ISR.
