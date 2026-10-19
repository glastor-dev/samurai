/**
 * Samurai Server & Web Application - Deno Deploy Entrypoint
 *
 * @module
 */

import { handler } from "./src/server.ts";

export * from "./src/server.ts";

if (import.meta.main) {
  const port = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 8000;
  console.log(`⚔️ [Samurai Server] Running on http://localhost:${port}`);
  Deno.serve({ port }, handler);
}
