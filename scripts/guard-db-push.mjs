const env = (process.env.NODE_ENV || "development").toLowerCase();
const allowDbPush = String(process.env.ALLOW_DB_PUSH || "false").toLowerCase() === "true";

if (env === "production" || env === "staging") {
  console.error(`[DB PUSH BLOCKED] prisma db push is disabled in ${env}. Use prisma migrate deploy.`);
  process.exit(1);
}

if (!allowDbPush) {
  console.error("[DB PUSH BLOCKED] Set ALLOW_DB_PUSH=true only for local throwaway environments.");
  process.exit(1);
}

console.log("[DB PUSH ALLOWED] Running prisma db push in local development mode.");
