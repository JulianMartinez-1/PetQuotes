const BASE_URL = process.env.PERF_BASE_URL ?? "http://localhost:3001/api";
const LOGIN_ITERATIONS = Number(process.env.PERF_LOGIN_ITERATIONS ?? 4);
const CREATE_ITERATIONS = Number(process.env.PERF_CREATE_ITERATIONS ?? 40);
const LOGIN_CONCURRENCY = Number(process.env.PERF_LOGIN_CONCURRENCY ?? 1);
const CREATE_CONCURRENCY = Number(process.env.PERF_CREATE_CONCURRENCY ?? 8);
const LOGIN_PACE_MS = Number(process.env.PERF_LOGIN_PACE_MS ?? 2500);

const SLO_LOGIN_P95_MS = Number(process.env.SLO_LOGIN_P95_MS ?? 2000);
const SLO_CREATE_P95_MS = Number(process.env.SLO_CREATE_P95_MS ?? 400);
const SLO_ERROR_RATE_MAX = Number(process.env.SLO_ERROR_RATE_MAX ?? 0.01);

function decodeJwtPayload(token) {
  const payload = token.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

function percentile(values, p) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

async function waitForReady(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Ignore transient errors while waiting for startup.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timeout waiting for readiness: ${url}`);
}

async function registerIfNeeded(email, role) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: "PetQuotes123",
      fullName: role === "CLIENT" ? "Perf Client" : "Perf Vet",
      role
    })
  });

  if (response.status === 201 || response.status === 200 || response.status === 409) {
    return;
  }

  const body = await response.text();
  throw new Error(`Unexpected register response (${role}): ${response.status} -> ${body}`);
}

async function login(email) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "PetQuotes123" })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Login failed (${email}) ${response.status} -> ${body}`);
  }

  return response.json();
}

async function runScenario(name, iterations, concurrency, taskFactory, postDelayMs = 0) {
  const durations = [];
  let errors = 0;
  let index = 0;
  const startedAt = Date.now();

  async function worker() {
    while (true) {
      const current = index;
      index += 1;
      if (current >= iterations) {
        return;
      }

      const stepStarted = Date.now();
      try {
        await taskFactory(current);
        durations.push(Date.now() - stepStarted);
      } catch {
        errors += 1;
      }

      if (postDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, postDelayMs));
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));
  const elapsedMs = Math.max(1, Date.now() - startedAt);
  const success = durations.length;
  const total = success + errors;

  return {
    name,
    total,
    success,
    errors,
    errorRate: total > 0 ? errors / total : 0,
    avgMs: success > 0 ? Math.round(durations.reduce((acc, item) => acc + item, 0) / success) : 0,
    p95Ms: percentile(durations, 95),
    p99Ms: percentile(durations, 99),
    throughputRps: Number(((success * 1000) / elapsedMs).toFixed(2))
  };
}

function printResult(result) {
  console.log(
    `[PERF] ${result.name} -> total=${result.total} ok=${result.success} err=${result.errors} errRate=${(
      result.errorRate * 100
    ).toFixed(2)}% avg=${result.avgMs}ms p95=${result.p95Ms}ms p99=${result.p99Ms}ms rps=${result.throughputRps}`
  );
}

async function main() {
  console.log(`[PERF] Starting Sprint 4 baseline against ${BASE_URL}`);

  await waitForReady(`${BASE_URL}/ready`);

  const runId = Date.now();
  const clientEmail = `perf.client.${runId}@petquotes.com`;
  const vetEmail = `perf.vet.${runId}@petquotes.com`;

  await registerIfNeeded(clientEmail, "CLIENT");
  await registerIfNeeded(vetEmail, "VETERINARY");

  const clientSession = await login(clientEmail);
  const vetSession = await login(vetEmail);
  const clientSub = decodeJwtPayload(clientSession.accessToken).sub;
  const vetSub = decodeJwtPayload(vetSession.accessToken).sub;

  const loginBenchmark = await runScenario("auth-login", LOGIN_ITERATIONS, LOGIN_CONCURRENCY, async () => {
    await login(clientEmail);
  }, LOGIN_PACE_MS);

  const createBenchmark = await runScenario(
    "appointments-create",
    CREATE_ITERATIONS,
    CREATE_CONCURRENCY,
    async (i) => {
      const startsAt = new Date(Date.now() + (i + 1) * 60_000).toISOString();
      const response = await fetch(`${BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientSession.accessToken}`,
          "x-idempotency-key": `perf-${runId}-${i}`
        },
        body: JSON.stringify({
          clientId: clientSub,
          petId: `perf-pet-${i}`,
          veterinarianId: vetSub,
          serviceId: "service-consulta",
          branchId: "branch-norte",
          startsAt,
          notes: "Perf baseline"
        })
      });

      if (!response.ok) {
        throw new Error(`Create appointment failed with ${response.status}`);
      }
    }
  );

  printResult(loginBenchmark);
  printResult(createBenchmark);

  const checks = [
    {
      ok: loginBenchmark.p95Ms <= SLO_LOGIN_P95_MS,
      message: `login p95 <= ${SLO_LOGIN_P95_MS}ms (actual ${loginBenchmark.p95Ms}ms)`
    },
    {
      ok: createBenchmark.p95Ms <= SLO_CREATE_P95_MS,
      message: `create p95 <= ${SLO_CREATE_P95_MS}ms (actual ${createBenchmark.p95Ms}ms)`
    },
    {
      ok: loginBenchmark.errorRate <= SLO_ERROR_RATE_MAX,
      message: `login errorRate <= ${(SLO_ERROR_RATE_MAX * 100).toFixed(2)}% (actual ${(loginBenchmark.errorRate * 100).toFixed(2)}%)`
    },
    {
      ok: createBenchmark.errorRate <= SLO_ERROR_RATE_MAX,
      message: `create errorRate <= ${(SLO_ERROR_RATE_MAX * 100).toFixed(2)}% (actual ${(createBenchmark.errorRate * 100).toFixed(2)}%)`
    }
  ];

  let failed = false;
  for (const check of checks) {
    if (check.ok) {
      console.log(`[PERF][SLO] OK ${check.message}`);
    } else {
      failed = true;
      console.error(`[PERF][SLO] FAIL ${check.message}`);
    }
  }

  if (failed) {
    process.exit(1);
  }

  console.log("[PERF] Sprint 4 baseline passed");
}

main().catch((error) => {
  console.error("[PERF] ERROR", error);
  process.exit(1);
});
