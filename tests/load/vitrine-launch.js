// Teste de carga (k6) — cenário de tráfego de lançamento da vitrine (#0025, M7).
// Rode com o BINÁRIO do k6 (não com Node): `k6 run tests/load/vitrine-launch.js`.
// Instalação, alvos e como ler o resultado: tests/load/README.md.
//
// Modela o pico de lançamento: muitas clientes abrindo o link da vitrine pública
// (caminho cacheável por ISR — o que precisa escalar) + pings de view/intent.
import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const SLUGS = (__ENV.SLUGS || "mariana-cosmeticos,carla-natura,joana-avon")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Pings de escrita são rate-limited por IP (intent 10/min). De uma única máquina o
// 429 é ESPERADO e não conta como erro; só respostas fora de 204/429 são problema.
const unexpected = new Counter("unexpected_responses");

export const options = {
  scenarios: {
    // Pico de lançamento: leitura da vitrine pública (+ landing às vezes).
    browse: {
      executor: "ramping-vus",
      exec: "browse",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 20 },
        { duration: "1m", target: 50 },
        { duration: "1m", target: 50 },
        { duration: "30s", target: 0 },
      ],
    },
    // Pings de view/intent concorrentes — valida os endpoints e o rate-limit sob carga.
    pings: {
      executor: "constant-arrival-rate",
      exec: "pings",
      rate: 3,
      timeUnit: "1s",
      duration: "3m",
      preAllocatedVUs: 10,
      maxVUs: 30,
    },
  },
  thresholds: {
    // O caminho de leitura é o que precisa aguentar o pico — limites estritos só nele:
    "http_req_failed{scenario:browse}": ["rate<0.01"],
    "http_req_duration{scenario:browse}": ["p(95)<1000", "p(99)<2500"],
    checks: ["rate>0.95"],
    unexpected_responses: ["count<1"],
  },
};

const JSON_HEADERS = { headers: { "Content-Type": "application/json" } };

function randomSlug() {
  return SLUGS[Math.floor(Math.random() * SLUGS.length)];
}

// VU "visitante": abre a vitrine e, de vez em quando, a landing. Pausa "humana".
export function browse() {
  const res = http.get(`${BASE_URL}/${randomSlug()}`, { tags: { name: "vitrine" } });
  check(res, { "vitrine respondeu 200": (r) => r.status === 200 });

  if (Math.random() < 0.2) {
    const home = http.get(`${BASE_URL}/`, { tags: { name: "landing" } });
    check(home, { "landing respondeu 200": (r) => r.status === 200 });
  }

  sleep(Math.random() * 3 + 1);
}

// Pings não-bloqueantes de view + intent. 204 = ok, 429 = rate-limit (também ok).
export function pings() {
  const slug = randomSlug();

  const view = http.post(`${BASE_URL}/api/view`, JSON.stringify({ slug }), {
    ...JSON_HEADERS,
    tags: { name: "view" },
  });
  if (view.status !== 204 && view.status !== 429) unexpected.add(1);

  const intent = http.post(
    `${BASE_URL}/api/intent`,
    JSON.stringify({ slug, referrer: "https://instagram.com/" }),
    { ...JSON_HEADERS, tags: { name: "intent" } },
  );
  if (intent.status !== 204 && intent.status !== 429) unexpected.add(1);
  check(intent, { "intent respondeu 204 ou 429": (r) => r.status === 204 || r.status === 429 });
}
