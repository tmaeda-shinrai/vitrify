# Teste de carga (k6) — cenário de lançamento

Simula o pico de tráfego do lançamento (#0025): muitas clientes abrindo o link da
vitrine pública ao mesmo tempo, com pings de view/intent concorrentes. O foco é o
**caminho de leitura** da vitrine (`/[slug]`, cacheável por ISR) — é o que precisa
escalar quando uma revendedora compartilha o link.

## Pré-requisitos

1. **k6** instalado (é um binário próprio, **não** roda no Node):
   - macOS: `brew install k6`
   - Linux (Debian/Ubuntu): veja https://grafana.com/docs/k6/latest/set-up/install-k6/
   - Docker: `docker run --rm -i grafana/k6 run - < tests/load/vitrine-launch.js`
2. Um **alvo no ar** com vitrines ativas. Rode contra um **build de produção** ou
   staging/prod — **nunca contra `next dev`** (sem cache de ISR e com compilação sob
   demanda, os números não significam nada):

   ```bash
   pnpm build && pnpm start    # serve em http://localhost:3000
   ```

## Rodando

```bash
# alvo local (slugs padrão = seed local: mariana-cosmeticos, carla-natura, joana-avon)
pnpm load
# ou direto:
k6 run tests/load/vitrine-launch.js

# contra staging/prod, com slugs reais (vitrines ATIVAS no alvo):
BASE_URL=https://staging.vitrinio.com.br SLUGS=loja-a,loja-b k6 run tests/load/vitrine-launch.js
```

Variáveis (via `-e` ou ambiente):

| Var        | Padrão                                       | O que é                                     |
| ---------- | -------------------------------------------- | ------------------------------------------- |
| `BASE_URL` | `http://localhost:3000`                      | URL base do alvo                            |
| `SLUGS`    | `mariana-cosmeticos,carla-natura,joana-avon` | slugs de vitrines ativas, vírgula-separados |

## Cenários

- **`browse`** (ramping-vus, sobe até 50 VUs) — abre `/[slug]` (e a landing em ~20%).
  É o pico de lançamento. **Limites estritos** aqui.
- **`pings`** (constant-arrival-rate, ~3/s) — `POST /api/view` + `POST /api/intent`,
  concorrentes com a leitura.

## Lendo o resultado

Limites (o teste falha se algum estourar):

- `http_req_failed{scenario:browse}` < 1% — a leitura da vitrine quase nunca erra.
- `http_req_duration{scenario:browse}` p95 < 1s, p99 < 2,5s.
- `checks` > 95%.
- `unexpected_responses` = 0 — qualquer resposta de view/intent fora de **204/429**
  (ex.: um 500) reprova.

> **429 nos pings é esperado, não é erro.** O intent é rate-limited por IP (10/min) e
> aqui tudo sai de uma máquina (1 IP). Por isso o `http_req_failed` **global** do
> resumo aparece alto — ele inclui os 429 dos pings. O que importa é o sub-limite
> `{scenario:browse}` e o `unexpected_responses`. Testar throughput real de escrita
> exigiria muitos IPs distintos (cada cliente é um IP em produção).

Ajuste `stages`/`rate` em `vitrine-launch.js` para cenários mais agressivos.
