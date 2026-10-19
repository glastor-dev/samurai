import { assertEquals, assertStringIncludes } from "@std/assert";
import { handler } from "../src/server.ts";

Deno.test("Server: GET /health returns 200 with status ok and brand", async () => {
  const req = new Request("http://localhost:8000/health");
  const res = await handler(req);
  assertEquals(res.status, 200);
  const data = await res.json();
  assertEquals(data.status, "ok");
  assertEquals(data.service, "samurai-edge");
  assertEquals(data.brand, "Glastor®");
});

Deno.test("Server: GET /install.sh returns executable shell script", async () => {
  const req = new Request("http://localhost:8000/install.sh");
  const res = await handler(req);
  assertEquals(res.status, 200);
  const text = await res.text();
  assertStringIncludes(text, "#!/usr/bin/env bash");
  assertStringIncludes(text, "jsr:@glastor-dev/samurai");
});

Deno.test("Server: GET /api/templates returns metadata list", async () => {
  const req = new Request(
    "http://localhost:8000/api/templates?stack=rust&lang=es",
  );
  const res = await handler(req);
  assertEquals(res.status, 200);
  const data = await res.json();
  assertEquals(data.stack, "rust");
  assertEquals(data.lang, "es");
  assertEquals(typeof data.total, "number");
  assertEquals(Array.isArray(data.files), true);
});

Deno.test("Server: POST /api/generate generates complete files payload", async () => {
  const req = new Request("http://localhost:8000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stack: "deno",
      lang: "es",
      mode: "hybrid",
      orgOrUser: "glastor-dev",
      repoName: "test-repo",
    }),
  });
  const res = await handler(req);
  assertEquals(res.status, 200);
  const data = await res.json();
  assertEquals(data.success, true);
  assertEquals(data.mode, "hybrid");
  assertEquals(Array.isArray(data.files), true);
  const hasCi = data.files.some((f: { relativePath: string }) =>
    f.relativePath === ".github/workflows/ci.yml"
  );
  assertEquals(hasCi, true);
});

Deno.test("Server: POST /api/download-zip produces valid in-memory zip archive", async () => {
  const req = new Request("http://localhost:8000/api/download-zip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stack: "deno",
      lang: "es",
      mode: "standalone",
      repoName: "custom-app",
    }),
  });
  const res = await handler(req);
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Content-Type"), "application/zip");
  const arrayBuffer = await res.arrayBuffer();
  assertEquals(arrayBuffer.byteLength > 1000, true);
});

Deno.test("Server: GET / serves modern HTML interface", async () => {
  const req = new Request("http://localhost:8000/");
  const res = await handler(req);
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Content-Type")?.includes("text/html"), true);
  const html = await res.text();
  assertStringIncludes(html, "SAMURAI");
  assertStringIncludes(html, "Glastor®");
});

Deno.test("Server: GET /unknown returns 404", async () => {
  const req = new Request("http://localhost:8000/unknown");
  const res = await handler(req);
  assertEquals(res.status, 404);
});
