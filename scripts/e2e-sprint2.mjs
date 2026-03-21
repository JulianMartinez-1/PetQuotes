import { execFileSync } from "node:child_process";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? process.env.SPRINT2_API_BASE_URL ?? "http://localhost:3001/api";
const PASSWORD = "PetQuotes123";
const MAX_LOGIN_ATTEMPTS = Number(process.env.AUTH_MAX_LOGIN_ATTEMPTS ?? 5);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function decodeJwtPayload(token) {
  const [, payload] = token.split(".");
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
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

async function ensureUser(email, role) {
  const register = await request("POST", "/auth/register", {
    email,
    password: PASSWORD,
    fullName: `E2E ${role}`
  });

  // Existing users can return 400 by design.
  if (!register.ok && register.status !== 400) {
    throw new Error(`No se pudo registrar ${email}: ${JSON.stringify(register.body)}`);
  }

  if (role !== "CLIENT") {
    ensureAuthRole(email, role);
  }

  const login = await request("POST", "/auth/login", { email, password: PASSWORD });
  assert(login.ok, `No se pudo iniciar sesión con ${email}: ${JSON.stringify(login.body)}`);

  const payload = decodeJwtPayload(login.body.accessToken);

  return {
    sub: payload.sub,
    token: login.body.accessToken,
    refreshToken: login.body.refreshToken
  };
}

async function testSprint1AuthFlows() {
  console.log("[E2E] Sprint 1 -> refresh/logout/lockout");

  const baseEmail = `e2e.s1.${Date.now()}@petquotes.com`;
  const authUser = await ensureUser(baseEmail, "CLIENT");

  const refresh = await request("POST", "/auth/refresh", {
    refreshToken: authUser.refreshToken
  });
  assert(refresh.ok, `Refresh falló: ${JSON.stringify(refresh.body)}`);

  const logout = await request("POST", "/auth/logout", {
    refreshToken: refresh.body.refreshToken
  });
  assert(logout.ok, `Logout falló: ${JSON.stringify(logout.body)}`);
  assert(logout.body.success === true, "Logout no devolvió success=true");

  const refreshAfterLogout = await request("POST", "/auth/refresh", {
    refreshToken: refresh.body.refreshToken
  });
  assert(refreshAfterLogout.status === 401, "Refresh luego de logout debería devolver 401");

  const lockoutEmail = `e2e.lockout.${Date.now()}@petquotes.com`;
  await ensureUser(lockoutEmail, "CLIENT");

  for (let i = 1; i <= MAX_LOGIN_ATTEMPTS; i += 1) {
    const badLogin = await request("POST", "/auth/login", {
      email: lockoutEmail,
      password: "BadPassword123"
    });
    assert(badLogin.status === 401, `Intento inválido ${i} devolvió ${badLogin.status}`);
  }

  const blockedLogin = await request("POST", "/auth/login", {
    email: lockoutEmail,
    password: PASSWORD
  });
  assert(blockedLogin.status === 401, "Lockout no se aplicó después de intentos fallidos");

  console.log("[E2E] Sprint 1 OK");
}

async function testSprint2RbacAndIdempotency() {
  console.log("[E2E] Sprint 2 -> RBAC e idempotencia");

  const seed = Date.now();
  const client = await ensureUser(`e2e.client.${seed}@petquotes.com`, "CLIENT");
  const vet = await ensureUser(`e2e.vet.${seed}@petquotes.com`, "VETERINARY");

  const idempotencyKey = `idem-e2e-${seed}`;
  const petId = `pet-e2e-${seed}`;
  ensurePetForOwner(client.sub, petId);
  const appointmentPayload = {
    clientId: client.sub,
    petId,
    veterinarianId: vet.sub,
    serviceId: "service-consulta",
    branchId: "branch-norte",
    startsAt: "2026-06-01T10:00:00.000Z",
    notes: "E2E Sprint 2"
  };

  const create1 = await request("POST", "/appointments", appointmentPayload, {
    Authorization: `Bearer ${client.token}`,
    "x-idempotency-key": idempotencyKey
  });
  assert(create1.ok, `Fallo create1: ${JSON.stringify(create1.body)}`);

  const create2 = await request("POST", "/appointments", appointmentPayload, {
    Authorization: `Bearer ${client.token}`,
    "x-idempotency-key": idempotencyKey
  });
  assert(create2.ok, `Fallo create2: ${JSON.stringify(create2.body)}`);
  assert(create1.body.id === create2.body.id, "Idempotencia rota: IDs distintos para la misma clave");

  const clientStatusUpdate = await request(
    "PATCH",
    `/appointments/${create1.body.id}/status`,
    { status: "CONFIRMED" },
    { Authorization: `Bearer ${client.token}` }
  );
  assert(clientStatusUpdate.status === 403, "RBAC roto: CLIENT pudo actualizar estado de cita");

  const vetStatusUpdate = await request(
    "PATCH",
    `/appointments/${create1.body.id}/status`,
    { status: "CONFIRMED" },
    { Authorization: `Bearer ${vet.token}` }
  );
  assert(vetStatusUpdate.ok, `VETERINARY no pudo confirmar cita: ${JSON.stringify(vetStatusUpdate.body)}`);
  assert(vetStatusUpdate.body.status === "CONFIRMED", "Estado final inválido tras confirmación veterinaria");

  console.log("[E2E] Sprint 2 OK");
}

function ensurePetForOwner(ownerId, petId) {
  const sql = `INSERT INTO "Pet" ("id", "ownerId", "name", "species", "createdAt", "updatedAt") VALUES ('${petId}', '${ownerId}', 'Pet E2E', 'Canino', NOW(), NOW()) ON CONFLICT ("id") DO NOTHING;`;

  try {
    execFileSync("docker", [
      "compose",
      "exec",
      "-T",
      "appointment-db",
      "psql",
      "-U",
      "postgres",
      "-d",
      "appointment_db",
      "-c",
      sql
    ], {
      stdio: "pipe"
    });
  } catch (error) {
    throw new Error(`No se pudo preparar mascota de prueba en DB: ${String(error)}`);
  }
}

function ensureAuthRole(email, role) {
  const sql = `UPDATE "User" SET "role"='${role}' WHERE "email"='${email}';`;

  try {
    execFileSync("docker", [
      "compose",
      "exec",
      "-T",
      "auth-db",
      "psql",
      "-U",
      "postgres",
      "-d",
      "auth_db",
      "-c",
      sql
    ], {
      stdio: "pipe"
    });
  } catch (error) {
    throw new Error(`No se pudo ajustar rol de prueba en auth DB: ${String(error)}`);
  }
}

async function main() {
  console.log("[E2E] Iniciando pruebas contra", API_BASE_URL);

  const preflight = await request("GET", "/health");
  if (!preflight.ok) {
    throw new Error(
      `Gateway no disponible en ${API_BASE_URL}. Verifica Docker/servicios y reintenta. status=${preflight.status}`
    );
  }

  await testSprint1AuthFlows();
  await testSprint2RbacAndIdempotency();

  console.log("[E2E] OK -> Sprint 1 + Sprint 2 validados");
}

main().catch((error) => {
  console.error("[E2E] ERROR:", error.message);
  process.exitCode = 1;
});
