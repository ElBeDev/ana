// Corre toda la QA contra un servidor local:  npm run qa -- http://localhost:3000
// La prueba de login va al final: provoca el bloqueo de 15 min por intentos fallidos
// (se limpia la tabla login_attempts antes y después). Solo para desarrollo, nunca contra producción.
import { spawnSync } from "node:child_process";
import postgres from "postgres";

const url = process.argv[2] ?? "http://localhost:3000";
if (!/localhost|127\.0\.0\.1/.test(url)) {
  console.error("La QA solo se corre contra un servidor local.");
  process.exit(1);
}
const sql = postgres(process.env.DATABASE_URL);
const clearAttempts = () => sql`delete from login_attempts`;

const suites = ["console", "editor", "settings", "media", "admin", "auth"];
let failed = false;
for (const suite of suites) {
  await clearAttempts();
  console.log(`\n— ${suite}`);
  const r = spawnSync(process.execPath, [`scripts/qa/${suite}.mjs`, url], { stdio: "inherit", env: process.env });
  if (r.status !== 0) {
    failed = true;
    break;
  }
}
await clearAttempts();
await sql.end();
console.log(failed ? "\n✗ QA con errores" : "\n✓ QA completa");
process.exit(failed ? 1 : 0);
