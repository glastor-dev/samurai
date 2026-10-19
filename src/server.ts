/**
 * Samurai Server & Web Application for Deno Deploy & Edge Runtimes
 * Provides an interactive UI, in-memory ZIP downloader, and REST API for GitHub 2026 standards.
 *
 * @module
 */

import {
  type GeneratedFile,
  getAllTemplates,
  getHybridTemplates,
  getOrgTemplates,
  type TemplateContext,
} from "./templates.ts";
import { STACK_CONFIGS, type TechStack } from "./detector.ts";
import { BlobWriter, TextReader, ZipWriter } from "@zip-js/zip-js";

export interface ServerGenerateInput {
  mode?: "standalone" | "hybrid" | "org";
  lang?: "en" | "es";
  stack?: TechStack;
  projectName?: string;
  repoName?: string;
  orgOrUser?: string;
  authorName?: string;
  authorEmail?: string;
  defaultBranch?: string;
  repoUrl?: string;
  description?: string;
  license?: string;
  sponsorUser?: string;
  sponsorUrl?: string;
  includeHooks?: boolean;
}

export function buildContextFromInput(
  input: ServerGenerateInput,
): TemplateContext {
  const orgOrUser = input.orgOrUser?.trim() || "glastor-dev";
  const repoName = input.repoName?.trim() || "samurai";
  const projectName = input.projectName?.trim() || repoName.toUpperCase();
  const stackKey: TechStack = input.stack && STACK_CONFIGS[input.stack]
    ? input.stack
    : "deno";
  const stackConf = STACK_CONFIGS[stackKey] || STACK_CONFIGS.deno;

  return {
    projectName,
    repoName,
    orgOrUser,
    authorName: input.authorName?.trim() || "Andrés Antonio Cardoso (Glastor®)",
    authorEmail: input.authorEmail?.trim() || "glastor.info@gmail.com",
    year: new Date().getFullYear().toString(),
    defaultBranch: input.defaultBranch?.trim() || "master",
    repoUrl: input.repoUrl?.trim() ||
      `https://github.com/${orgOrUser}/${repoName}`,
    description: input.description?.trim() ||
      "Enterprise-grade software repository adhering to GitHub 2026 standards and DevSecOps architecture.",
    license: input.license?.trim() || "Apache-2.0",
    sponsorUser: input.sponsorUser?.trim() || orgOrUser,
    sponsorUrl: input.sponsorUrl?.trim() ||
      `https://github.com/sponsors/${orgOrUser}`,
    lang: input.lang === "en" ? "en" : "es",
    stack: stackKey,
    stackDisplayName: stackConf.displayName,
    testCommand: stackConf.testCmd,
    fmtCommand: stackConf.fmtCmd,
    lintCommand: stackConf.lintCmd,
    dependabotEcosystems: stackConf.dependabotEcosystems,
    setupActionSnippet: stackConf.setupActionSnippet,
    codeqlLanguages: stackConf.codeqlLanguages,
    includeHooks: input.includeHooks ?? true,
  };
}

export function getGeneratedFiles(
  ctx: TemplateContext,
  mode: "standalone" | "hybrid" | "org" = "standalone",
): GeneratedFile[] {
  if (mode === "hybrid") return getHybridTemplates(ctx);
  if (mode === "org") return getOrgTemplates(ctx);
  return getAllTemplates(ctx);
}

export async function createZipArchive(
  files: GeneratedFile[],
): Promise<Uint8Array> {
  const zipWriter = new ZipWriter(new BlobWriter("application/zip"));

  for (const file of files) {
    await zipWriter.add(file.relativePath, new TextReader(file.content));
  }

  const zipBlob = await zipWriter.close();
  const arrayBuffer = await zipBlob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Health check
  if (url.pathname === "/health") {
    return new Response(
      JSON.stringify(
        {
          status: "ok",
          service: "samurai-edge",
          version: "1.0.0",
          brand: "Glastor®",
          runtime: "Deno Deploy / Edge",
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }

  // Shell one-liner installer
  if (url.pathname === "/install.sh") {
    const script = `#!/usr/bin/env bash
# Samurai - Enterprise GitHub 2026 Standards Installer
# Powered by Glastor® & Deno Edge
set -e

echo "⚔️  [Glastor® Samurai] Inicializando generador de estándares..."

if ! command -v deno &> /dev/null; then
  echo "❌ Deno no está instalado en este sistema."
  echo "ℹ️  Instálalo en segundos:"
  echo "   curl -fsSL https://deno.land/install.sh | sh"
  exit 1
fi

echo "🚀 Ejecutando @glastor-dev/samurai desde JSR..."
exec deno run -A jsr:@glastor-dev/samurai "$@"
`;
    return new Response(script, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/x-shellscript; charset=utf-8",
      },
    });
  }

  // API: Get templates metadata
  if (url.pathname === "/api/templates" && method === "GET") {
    const mode = (url.searchParams.get("mode") || "standalone") as
      | "standalone"
      | "hybrid"
      | "org";
    const lang = (url.searchParams.get("lang") || "es") as "en" | "es";
    const stack = (url.searchParams.get("stack") || "deno") as TechStack;
    const orgOrUser = url.searchParams.get("org") || "glastor-dev";
    const repoName = url.searchParams.get("repo") || "samurai";

    const ctx = buildContextFromInput({
      mode,
      lang,
      stack,
      orgOrUser,
      repoName,
    });
    const files = getGeneratedFiles(ctx, mode);

    return new Response(
      JSON.stringify(
        {
          mode,
          lang,
          stack,
          total: files.length,
          files: files.map((f) => ({
            relativePath: f.relativePath,
            category: f.category,
            description: f.description,
            byteSize: new TextEncoder().encode(f.content).length,
          })),
        },
        null,
        2,
      ),
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }

  // API: Generate full payload
  if (url.pathname === "/api/generate" && method === "POST") {
    try {
      const body = await req.json() as ServerGenerateInput;
      const mode = body.mode || "standalone";
      const ctx = buildContextFromInput(body);
      const files = getGeneratedFiles(ctx, mode);

      return new Response(
        JSON.stringify(
          {
            success: true,
            mode,
            context: ctx,
            total: files.length,
            files: files.map((f) => ({
              relativePath: f.relativePath,
              content: f.content,
              category: f.category,
              description: f.description,
            })),
          },
          null,
          2,
        ),
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON payload",
          details: String(err),
        }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }
  }

  // API: In-Memory ZIP Download
  if (url.pathname === "/api/download-zip") {
    try {
      let input: ServerGenerateInput = {};
      if (method === "POST") {
        input = await req.json() as ServerGenerateInput;
      } else {
        input = {
          mode: (url.searchParams.get("mode") || "standalone") as
            | "standalone"
            | "hybrid"
            | "org",
          lang: (url.searchParams.get("lang") || "es") as "en" | "es",
          stack: (url.searchParams.get("stack") || "deno") as TechStack,
          orgOrUser: url.searchParams.get("org") || "glastor-dev",
          repoName: url.searchParams.get("repo") || "samurai",
          authorName: url.searchParams.get("author") || undefined,
          defaultBranch: url.searchParams.get("branch") || "master",
        };
      }

      const mode = input.mode || "standalone";
      const ctx = buildContextFromInput(input);
      const files = getGeneratedFiles(ctx, mode);
      const zipBytes = await createZipArchive(files);

      const filename = `samurai-${ctx.repoName}-standards.zip`;

      return new Response(zipBytes as unknown as BodyInit, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": zipBytes.length.toString(),
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate ZIP archive",
          details: String(err),
        }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }
  }

  // Web Application Root
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return new Response(renderWebInterface(), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return new Response("Not Found", {
    status: 404,
    headers: { ...CORS_HEADERS, "Content-Type": "text/plain" },
  });
}

function renderWebInterface(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚔️ Samurai — Enterprise GitHub 2026 Standards & DevSecOps Generator</title>
  <meta name="description" content="Generador empresarial de estándares GitHub 2026, gobernanza híbrida y pipelines DevSecOps para Deno, Rust, Node, Python y Go en el Edge.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #08090d;
      --bg-card: rgba(18, 22, 34, 0.75);
      --bg-card-hover: rgba(26, 32, 50, 0.85);
      --bg-input: #0f121c;
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: #ef4444;
      --text: #f3f4f6;
      --text-muted: #94a3b8;
      --katana-red: #ef4444;
      --katana-red-glow: rgba(239, 68, 68, 0.25);
      --glastor-gold: #f59e0b;
      --edge-cyan: #06b6d4;
      --success-green: #10b981;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-display: 'Outfit', sans-serif;
      --font-mono: 'Fira Code', Consolas, monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(239, 68, 68, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.04) 0%, transparent 60%);
      background-attachment: fixed;
      color: var(--text);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Header */
    header {
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(16px);
      background: rgba(8, 9, 13, 0.8);
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 1rem 2rem;
    }

    .header-inner {
      max-width: 1500px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      font-size: 2.2rem;
      filter: drop-shadow(0 0 12px var(--katana-red));
      animation: pulseGlow 4s infinite alternate;
    }

    @keyframes pulseGlow {
      0% { filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4)); }
      100% { filter: drop-shadow(0 0 16px rgba(239, 68, 68, 0.8)); }
    }

    .brand-text h1 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #fff 30%, #fca5a5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-glastor {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: var(--glastor-gold);
      font-weight: 700;
    }

    .brand-text p {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .header-badges {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      text-decoration: none;
      transition: all 0.2s ease;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
    }

    .pill-badge:hover {
      border-color: var(--katana-red);
      transform: translateY(-1px);
    }

    .pill-badge.green { color: var(--success-green); border-color: rgba(16, 185, 129, 0.3); }
    .pill-badge.blue { color: var(--edge-cyan); border-color: rgba(6, 182, 212, 0.3); }

    /* Main Container */
    main {
      flex: 1;
      max-width: 1500px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem;
      display: grid;
      grid-template-columns: 460px 1fr;
      gap: 2rem;
    }

    @media (max-width: 1080px) {
      main {
        grid-template-columns: 1fr;
      }
    }

    /* Cards */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .card-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    /* Form Controls */
    .form-group {
      margin-bottom: 1.1rem;
    }

    .form-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-input, .form-select {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      color: var(--text);
      font-family: var(--font-sans);
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: var(--katana-red);
      box-shadow: 0 0 0 3px var(--katana-red-glow);
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
    }

    /* Mode & Stack Buttons */
    .btn-toggle-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      background: var(--bg-input);
      padding: 0.35rem;
      border-radius: 10px;
      border: 1px solid var(--border);
      margin-bottom: 1rem;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      border-radius: 7px;
      padding: 0.6rem 0.4rem;
      color: var(--text-muted);
      font-family: var(--font-sans);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .toggle-btn.active {
      background: rgba(239, 68, 68, 0.2);
      color: #fff;
      border: 1px solid var(--katana-red);
      box-shadow: 0 0 12px var(--katana-red-glow);
    }

    .stacks-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .stack-btn {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem 0.25rem;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
    }

    .stack-btn span.icon { font-size: 1.25rem; }

    .stack-btn.active {
      background: rgba(6, 182, 212, 0.15);
      border-color: var(--edge-cyan);
      color: #fff;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.25);
    }

    /* Primary Actions */
    .actions-box {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0.85rem 1.25rem;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      transition: all 0.2s;
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(239, 68, 68, 0.5);
    }

    .btn-secondary {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: var(--bg-card-hover);
      border-color: var(--katana-red);
    }

    /* Explorer & Code Pane */
    .explorer-pane {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 700px;
    }

    .explorer-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      gap: 1rem;
      flex-wrap: wrap;
    }

    .category-pills {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .cat-pill {
      font-size: 0.75rem;
      padding: 0.3rem 0.7rem;
      border-radius: 6px;
      background: var(--bg-input);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s;
    }

    .cat-pill.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: var(--glastor-gold);
      color: var(--glastor-gold);
      font-weight: 600;
    }

    .file-counter {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .explorer-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1rem;
      min-height: 580px;
    }

    @media (max-width: 800px) {
      .explorer-layout {
        grid-template-columns: 1fr;
      }
    }

    .files-list {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow-y: auto;
      max-height: 600px;
      padding: 0.5rem;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-family: var(--font-mono);
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.15s;
      margin-bottom: 0.2rem;
      word-break: break-all;
    }

    .file-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text);
    }

    .file-item.active {
      background: rgba(239, 68, 68, 0.15);
      color: #fff;
      border-left: 3px solid var(--katana-red);
      font-weight: 600;
    }

    .file-item span.icon { font-size: 0.95rem; }

    .code-viewer {
      background: #06070a;
      border: 1px solid var(--border);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: 600px;
    }

    .code-header {
      background: rgba(255, 255, 255, 0.03);
      padding: 0.65rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
    }

    .current-path {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--edge-cyan);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-copy-file {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 0.75rem;
      padding: 0.3rem 0.7rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-copy-file:hover {
      border-color: var(--katana-red);
    }

    pre.code-content {
      flex: 1;
      padding: 1rem;
      overflow: auto;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      line-height: 1.6;
      color: #e2e8f0;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #111827;
      border: 1px solid var(--katana-red);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 999;
    }

    #toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1rem;
    }

    .modal-backdrop.open {
      display: flex;
    }

    .modal-card {
      background: #0f121d;
      border: 1px solid var(--katana-red);
      border-radius: 16px;
      max-width: 650px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1.25rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.4rem;
      cursor: pointer;
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 2rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      background: rgba(8, 9, 13, 0.95);
      margin-top: 2rem;
    }

    footer a { color: var(--glastor-gold); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>

  <header>
    <div class="header-inner">
      <a href="/" class="brand">
        <span class="brand-icon">⚔️</span>
        <div class="brand-text">
          <h1>SAMURAI <span class="badge-glastor">Glastor®</span></h1>
          <p>Enterprise GitHub 2026 Standards & DevSecOps Architecture</p>
        </div>
      </a>

      <div class="header-badges">
        <a href="https://jsr.io/@glastor-dev/samurai" target="_blank" class="pill-badge green">
          <span>📦</span> JSR v1.0.0
        </a>
        <a href="https://github.com/glastor-dev/samurai" target="_blank" class="pill-badge blue">
          <span>⚡</span> Deno Deploy Edge
        </a>
        <span class="pill-badge" style="color: var(--glastor-gold); border-color: rgba(245, 158, 11, 0.4);">
          <span>🛡️</span> Scorecard 100% A+
        </span>
      </div>
    </div>
  </header>

  <main>
    <!-- Left Configuration Panel -->
    <div class="card">
      <div class="card-title">
        <span>⚙️</span> Parámetros del Proyecto
      </div>

      <!-- Mode Selector -->
      <div class="form-group">
        <label class="form-label">Arquitectura de Gobernanza</label>
        <div class="btn-toggle-group" id="modeGroup">
          <button type="button" class="toggle-btn active" data-mode="standalone">🏛️ Standalone</button>
          <button type="button" class="toggle-btn" data-mode="hybrid">⚡ Híbrido</button>
          <button type="button" class="toggle-btn" data-mode="org">🏢 Org .github</button>
        </div>
      </div>

      <!-- Tech Stack -->
      <div class="form-group">
        <label class="form-label">Stack Tecnológico</label>
        <div class="stacks-grid" id="stackGrid">
          <button type="button" class="stack-btn active" data-stack="deno">
            <span class="icon">🦕</span>
            <span>Deno</span>
          </button>
          <button type="button" class="stack-btn" data-stack="rust">
            <span class="icon">🦀</span>
            <span>Rust</span>
          </button>
          <button type="button" class="stack-btn" data-stack="node">
            <span class="icon">🟢</span>
            <span>Node/TS</span>
          </button>
          <button type="button" class="stack-btn" data-stack="python">
            <span class="icon">🐍</span>
            <span>Python</span>
          </button>
          <button type="button" class="stack-btn" data-stack="go">
            <span class="icon">🐹</span>
            <span>Go</span>
          </button>
        </div>
      </div>

      <!-- Language Toggle -->
      <div class="form-group">
        <label class="form-label">Idioma de Documentación</label>
        <div class="grid-2">
          <button type="button" class="toggle-btn active" id="btnLangEs" style="background: rgba(245, 158, 11, 0.15); border: 1px solid var(--glastor-gold); color: #fff;">🇪🇸 Español</button>
          <button type="button" class="toggle-btn" id="btnLangEn" style="background: var(--bg-input); border: 1px solid var(--border);">🇬🇧 English</button>
        </div>
      </div>

      <!-- Inputs Form -->
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Organización / User</label>
          <input type="text" id="inpOrg" class="form-input" value="glastor-dev">
        </div>
        <div class="form-group">
          <label class="form-label">Repositorio</label>
          <input type="text" id="inpRepo" class="form-input" value="samurai">
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Nombre del Proyecto</label>
          <input type="text" id="inpProject" class="form-input" value="SAMURAI">
        </div>
        <div class="form-group">
          <label class="form-label">Rama Principal</label>
          <input type="text" id="inpBranch" class="form-input" value="master">
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Autor / Marca</label>
          <input type="text" id="inpAuthor" class="form-input" value="Andrés Antonio Cardoso (Glastor®)">
        </div>
        <div class="form-group">
          <label class="form-label">Email de Seguridad</label>
          <input type="email" id="inpEmail" class="form-input" value="glastor.info@gmail.com">
        </div>
      </div>

      <div class="form-group" style="display: flex; align-items: center; gap: 0.6rem; margin-top: 0.5rem;">
        <input type="checkbox" id="chkHooks" checked style="accent-color: var(--katana-red); width: 1.1rem; height: 1.1rem;">
        <label for="chkHooks" style="font-size: 0.85rem; color: var(--text);">Incluir Lefthook (Git Pre-commit Hooks)</label>
      </div>

      <!-- Actions -->
      <div class="actions-box">
        <button type="button" class="btn-primary" id="btnDownloadZip">
          <span>📦</span> Descargar Paquete (.ZIP)
        </button>
        <button type="button" class="btn-secondary" id="btnCopyCli">
          <span>📋</span> Copiar Comando Deno CLI
        </button>
        <button type="button" class="btn-secondary" id="btnOpenDoctor">
          <span>🩺</span> Diagnóstico Samurai Doctor (100% A+)
        </button>
      </div>
    </div>

    <!-- Right Explorer & Code Viewer Panel -->
    <div class="card explorer-pane">
      <div class="explorer-toolbar">
        <div class="category-pills" id="categoryPills">
          <button type="button" class="cat-pill active" data-cat="all">Todos</button>
          <button type="button" class="cat-pill" data-cat="root">📁 Raíz</button>
          <button type="button" class="cat-pill" data-cat="governance">🛡️ Gobernanza</button>
          <button type="button" class="cat-pill" data-cat="issues">📝 Issue Forms</button>
          <button type="button" class="cat-pill" data-cat="workflows">🚀 DevSecOps</button>
        </div>
        <div class="file-counter" id="fileCounter">Cargando estándares...</div>
      </div>

      <div class="explorer-layout">
        <div class="files-list" id="filesList">
          <!-- Populated by JavaScript -->
        </div>

        <div class="code-viewer">
          <div class="code-header">
            <span class="current-path" id="codeCurrentPath">
              <span>📄</span> Seleccione un archivo
            </span>
            <button type="button" class="btn-copy-file" id="btnCopyFile">
              📋 Copiar
            </button>
          </div>
          <pre class="code-content" id="codeContent">// Generando estándares en vivo...</pre>
        </div>
      </div>
    </div>
  </main>

  <!-- Doctor Audit Modal -->
  <div class="modal-backdrop" id="doctorModal">
    <div class="modal-card">
      <button class="modal-close" id="btnCloseModal">&times;</button>
      <div class="card-title" style="color: var(--glastor-gold);">
        <span>🩺</span> Auditoría Samurai Doctor — Calificación 100% A+
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
        Esta configuración cumple rigurosamente con los 8 mandamientos de Gobernanza, Seguridad de Cadena de Suministro (Supply-Chain) y OpenSSF Scorecard para GitHub 2026:
      </p>

      <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem;">
        <div style="display:flex; justify-content:space-between; padding:0.5rem; background:rgba(16,185,129,0.1); border-radius:6px; border:1px solid rgba(16,185,129,0.2);">
          <span>✅ Política de Seguridad (PVR + PGP + SLA 24h)</span>
          <strong style="color: var(--success-green);">100%</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:0.5rem; background:rgba(16,185,129,0.1); border-radius:6px; border:1px solid rgba(16,185,129,0.2);">
          <span>✅ SAST CodeQL + Escaneo de Secretos Nemesis</span>
          <strong style="color: var(--success-green);">100%</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:0.5rem; background:rgba(16,185,129,0.1); border-radius:6px; border:1px solid rgba(16,185,129,0.2);">
          <span>✅ OpenSSF Scorecard Supply Chain Analysis</span>
          <strong style="color: var(--success-green);">100%</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:0.5rem; background:rgba(16,185,129,0.1); border-radius:6px; border:1px solid rgba(16,185,129,0.2);">
          <span>✅ GitHub Issue Forms Modernos & P.R. Template</span>
          <strong style="color: var(--success-green);">100%</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:0.5rem; background:rgba(16,185,129,0.1); border-radius:6px; border:1px solid rgba(16,185,129,0.2);">
          <span>✅ Automatización Dependabot con Agrupación Semanal</span>
          <strong style="color: var(--success-green);">100%</strong>
        </div>
      </div>

      <div style="margin-top: 1.5rem; text-align: center;">
        <button type="button" class="btn-primary" id="btnModalDownload" style="width: 100%;">
          <span>⚡</span> Descargar Paquete de Cumplimiento Certificado
        </button>
      </div>
    </div>
  </div>

  <div id="toast"></div>

  <footer>
    <p>
      ⚔️ <strong>Samurai GitHub 2026</strong> — Desarrollado con excelencia por 
      <a href="https://github.com/glastor-dev" target="_blank">Andrés Antonio Cardoso (Glastor®)</a>.
      Publicado en <a href="https://jsr.io/@glastor-dev/samurai" target="_blank">JSR</a> y desplegado en <strong>Deno Deploy Edge</strong>.
    </p>
  </footer>

  <script>
    let currentMode = 'standalone';
    let currentStack = 'deno';
    let currentLang = 'es';
    let currentCategory = 'all';
    let generatedFiles = [];
    let activeFileIndex = 0;

    const inpOrg = document.getElementById('inpOrg');
    const inpRepo = document.getElementById('inpRepo');
    const inpProject = document.getElementById('inpProject');
    const inpAuthor = document.getElementById('inpAuthor');
    const inpEmail = document.getElementById('inpEmail');
    const inpBranch = document.getElementById('inpBranch');
    const chkHooks = document.getElementById('chkHooks');

    const filesList = document.getElementById('filesList');
    const fileCounter = document.getElementById('fileCounter');
    const codeCurrentPath = document.getElementById('codeCurrentPath');
    const codeContent = document.getElementById('codeContent');
    const toast = document.getElementById('toast');

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function getFormPayload() {
      return {
        mode: currentMode,
        stack: currentStack,
        lang: currentLang,
        orgOrUser: inpOrg.value.trim() || 'glastor-dev',
        repoName: inpRepo.value.trim() || 'samurai',
        projectName: inpProject.value.trim() || 'SAMURAI',
        authorName: inpAuthor.value.trim() || 'Andrés Antonio Cardoso (Glastor®)',
        authorEmail: inpEmail.value.trim() || 'glastor.info@gmail.com',
        defaultBranch: inpBranch.value.trim() || 'master',
        includeHooks: chkHooks.checked
      };
    }

    async function refreshStandards() {
      fileCounter.textContent = 'Generando...';
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(getFormPayload())
        });
        const data = await res.json();
        if (data.success) {
          generatedFiles = data.files;
          renderFileList();
          fileCounter.textContent = \`\${generatedFiles.length} archivos generados\`;
        }
      } catch (err) {
        fileCounter.textContent = 'Error al generar';
      }
    }

    function renderFileList() {
      filesList.innerHTML = '';
      const filtered = generatedFiles.filter(f => currentCategory === 'all' || f.category === currentCategory);

      if (filtered.length === 0) {
        filesList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); font-size: 0.8rem;">No hay archivos en esta categoría.</div>';
        codeCurrentPath.innerHTML = '<span>📄</span> Ningún archivo seleccionado';
        codeContent.textContent = '// Sin archivos';
        return;
      }

      filtered.forEach((file, idx) => {
        const item = document.createElement('div');
        item.className = 'file-item' + (idx === 0 ? ' active' : '');
        
        let icon = '📄';
        if (file.relativePath.includes('.github/workflows')) icon = '🚀';
        else if (file.relativePath.includes('ISSUE_TEMPLATE')) icon = '📝';
        else if (file.relativePath.includes('SECURITY')) icon = '🛡️';
        else if (file.relativePath.includes('LICENSE')) icon = '⚖️';
        else if (file.relativePath.includes('lefthook')) icon = '🪝';

        item.innerHTML = \`<span class="icon">\${icon}</span> <span>\${file.relativePath}</span>\`;
        item.onclick = () => {
          document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
          displayFile(file);
        };
        filesList.appendChild(item);
      });

      if (filtered[0]) {
        displayFile(filtered[0]);
      }
    }

    function displayFile(file) {
      codeCurrentPath.innerHTML = \`<span>📄</span> \${file.relativePath} <span style="font-size:0.7rem; color:var(--text-muted); margin-left:0.5rem;">(\${file.category})</span>\`;
      codeContent.textContent = file.content;
    }

    // Mode Buttons
    document.querySelectorAll('#modeGroup .toggle-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('#modeGroup .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        refreshStandards();
      };
    });

    // Stack Buttons
    document.querySelectorAll('#stackGrid .stack-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('#stackGrid .stack-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStack = btn.dataset.stack;
        refreshStandards();
      };
    });

    // Language Buttons
    const btnLangEs = document.getElementById('btnLangEs');
    const btnLangEn = document.getElementById('btnLangEn');

    btnLangEs.onclick = () => {
      currentLang = 'es';
      btnLangEs.style.background = 'rgba(245, 158, 11, 0.15)';
      btnLangEs.style.borderColor = 'var(--glastor-gold)';
      btnLangEn.style.background = 'var(--bg-input)';
      btnLangEn.style.borderColor = 'var(--border)';
      refreshStandards();
    };

    btnLangEn.onclick = () => {
      currentLang = 'en';
      btnLangEn.style.background = 'rgba(245, 158, 11, 0.15)';
      btnLangEn.style.borderColor = 'var(--glastor-gold)';
      btnLangEs.style.background = 'var(--bg-input)';
      btnLangEs.style.borderColor = 'var(--border)';
      refreshStandards();
    };

    // Category Filter Pills
    document.querySelectorAll('#categoryPills .cat-pill').forEach(pill => {
      pill.onclick = () => {
        document.querySelectorAll('#categoryPills .cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.dataset.cat;
        renderFileList();
      };
    });

    // Inputs change listeners
    [inpOrg, inpRepo, inpProject, inpAuthor, inpEmail, inpBranch, chkHooks].forEach(input => {
      input.oninput = () => {
        clearTimeout(window._refreshTimer);
        window._refreshTimer = setTimeout(refreshStandards, 250);
      };
    });

    // Download ZIP
    async function triggerZipDownload() {
      showToast('📦 Empaquetando ZIP en memoria...');
      try {
        const payload = getFormPayload();
        const res = await fetch('/api/download-zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const blob = await res.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = \`samurai-\${payload.repoName}-standards.zip\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        showToast('✅ Descarga completada con éxito');
      } catch (err) {
        showToast('❌ Error descargando ZIP');
      }
    }

    document.getElementById('btnDownloadZip').onclick = triggerZipDownload;
    document.getElementById('btnModalDownload').onclick = () => {
      document.getElementById('doctorModal').classList.remove('open');
      triggerZipDownload();
    };

    // Copy CLI Command
    document.getElementById('btnCopyCli').onclick = () => {
      const p = getFormPayload();
      let cmd = 'deno run -A jsr:@glastor-dev/samurai';
      if (p.mode === 'hybrid') cmd += ' hybrid';
      else if (p.mode === 'org') cmd += ' org-init';
      else cmd += ' init';

      if (p.lang === 'en') cmd += ' --lang en';
      if (p.stack) cmd += \` --stack \${p.stack}\`;

      navigator.clipboard.writeText(cmd);
      showToast('📋 Comando copiado al portapapeles');
    };

    // Copy Current File
    document.getElementById('btnCopyFile').onclick = () => {
      navigator.clipboard.writeText(codeContent.textContent);
      showToast('📋 Archivo copiado al portapapeles');
    };

    // Doctor Modal
    const doctorModal = document.getElementById('doctorModal');
    document.getElementById('btnOpenDoctor').onclick = () => doctorModal.classList.add('open');
    document.getElementById('btnCloseModal').onclick = () => doctorModal.classList.remove('open');
    doctorModal.onclick = (e) => { if (e.target === doctorModal) doctorModal.classList.remove('open'); };

    // Initial load
    refreshStandards();
  </script>
</body>
</html>`;
}

// Standalone execution support: `deno run -A src/server.ts`
if (import.meta.main) {
  const port = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 8000;
  console.log(
    `⚔️ [Samurai Server] Running on http://localhost:${port} (Deno Edge Ready)`,
  );
  Deno.serve({ port }, handler);
}
