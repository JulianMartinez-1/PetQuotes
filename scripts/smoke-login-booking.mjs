const API_BASE_URL = process.env.SMOKE_API_BASE_URL ?? "http://localhost:3001/api";

const CLIENT_EMAIL = process.env.SEED_CLIENT_EMAIL || "client.demo@petquotes.local";
const CLIENT_PASSWORD = process.env.SEED_CLIENT_PASSWORD || "PetQuotes123";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(method, path, body, headers = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    body: parsed
  };
}

function nextSlotIso() {
  return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
}

async function main() {
  console.log("[SMOKE] Validando /api/ready");
  const ready = await fetch("http://localhost:3001/api/ready");
  assert(ready.ok, `Gateway not ready: ${ready.status}`);

  console.log("[SMOKE] Login con cliente seed");
  const login = await request("POST", "/auth/login", {
    email: CLIENT_EMAIL,
    password: CLIENT_PASSWORD
  });
  assert(login.ok, `Login failed: ${JSON.stringify(login.body)}`);

  const token = login.body?.accessToken;
  assert(Boolean(token), "Login response missing accessToken");

  const idempotencyKey = `smoke-${Date.now()}`;
  const createPayload = {
    clientId: "client-demo-001",
    petId: "pet-demo-001",
    veterinarianId: "vet-demo-001",
    serviceId: "service-consulta",
    branchId: "branch-norte",
    startsAt: nextSlotIso(),
    notes: "Smoke booking validation"
  };

  console.log("[SMOKE] Crear cita");
  const create = await request("POST", "/appointments", createPayload, {
    Authorization: `Bearer ${token}`,
    "x-idempotency-key": idempotencyKey
  });
  assert(create.ok, `Create appointment failed: ${JSON.stringify(create.body)}`);
  const appointmentId = create.body?.id;
  assert(Boolean(appointmentId), "Create response missing appointment id");

  console.log("[SMOKE] Consultar historial por mascota");
  const history = await request("GET", "/appointments/pet/pet-demo-001", null, {
    Authorization: `Bearer ${token}`
  });
  assert(history.ok, `List appointments failed: ${JSON.stringify(history.body)}`);

  const found = Array.isArray(history.body) && history.body.some((item) => item.id === appointmentId);
  assert(found, "Created appointment not found in pet history");

  console.log("[SMOKE] OK login + booking end-to-end");
}

main().catch((error) => {
  console.error("[SMOKE] ERROR", error.message);
  process.exitCode = 1;
});
