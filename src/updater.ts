import * as path from "@std/path";
import * as fs from "@std/fs";
import * as colors from "@std/fmt/colors";
import {
  type GeneratedFile,
  getAllTemplates,
  type TemplateContext,
} from "./templates.ts";
import { resolveContext } from "./generator.ts";
import type { TechStack } from "./detector.ts";

export interface UpdateOptions {
  targetDir?: string;
  createMissing?: boolean;
  backup?: boolean;
  dryRun?: boolean;
  showDiff?: boolean;
  lang?: "en" | "es";
  stack?: TechStack | "auto";
  includeHooks?: boolean;
  forceCi?: boolean;
  files?: string[];
  customContext?: Partial<TemplateContext>;
}

export interface FileUpdateStatus {
  relativePath: string;
  resolvedPath: string;
  status: "up-to-date" | "updated" | "created" | "missing" | "skipped";
  description: string;
  additions: number;
  deletions: number;
  diffSnippet?: string;
}

export interface UpdateReport {
  targetDir: string;
  updated: FileUpdateStatus[];
  upToDate: FileUpdateStatus[];
  created: FileUpdateStatus[];
  missing: FileUpdateStatus[];
  skipped: FileUpdateStatus[];
  context: TemplateContext;
  dryRun: boolean;
  backupCreated: boolean;
}

/**
 * Known dual-path mapping for GitHub standards files
 * Allows finding files whether they exist in root or in .github/
 */
export const DUAL_PATH_MAPPINGS: Array<{
  id: string;
  candidates: string[];
  defaultPath: string;
}> = [
  {
    id: "SECURITY.md",
    candidates: ["SECURITY.md", ".github/SECURITY.md"],
    defaultPath: "SECURITY.md",
  },
  {
    id: "CONTRIBUTORS.md",
    candidates: ["CONTRIBUTORS.md", ".github/CONTRIBUTORS.md"],
    defaultPath: "CONTRIBUTORS.md",
  },
  {
    id: "CODEOWNERS",
    candidates: [".github/CODEOWNERS", "CODEOWNERS"],
    defaultPath: ".github/CODEOWNERS",
  },
  {
    id: "CODE_OF_CONDUCT.md",
    candidates: [".github/CODE_OF_CONDUCT.md", "CODE_OF_CONDUCT.md"],
    defaultPath: ".github/CODE_OF_CONDUCT.md",
  },
  {
    id: "CONTRIBUTING.md",
    candidates: [".github/CONTRIBUTING.md", "CONTRIBUTING.md"],
    defaultPath: ".github/CONTRIBUTING.md",
  },
  {
    id: "SUPPORT.md",
    candidates: [".github/SUPPORT.md", "SUPPORT.md"],
    defaultPath: ".github/SUPPORT.md",
  },
  {
    id: "COMMIT_CONVENTION.md",
    candidates: [".github/COMMIT_CONVENTION.md", "COMMIT_CONVENTION.md"],
    defaultPath: ".github/COMMIT_CONVENTION.md",
  },
  {
    id: "PULL_REQUEST_TEMPLATE.md",
    candidates: [
      ".github/PULL_REQUEST_TEMPLATE.md",
      "PULL_REQUEST_TEMPLATE.md",
    ],
    defaultPath: ".github/PULL_REQUEST_TEMPLATE.md",
  },
  {
    id: "FUNDING.yml",
    candidates: [".github/FUNDING.yml", "FUNDING.yml"],
    defaultPath: ".github/FUNDING.yml",
  },
];

/**
 * Normalizes text lines for accurate comparison (handling CRLF vs LF)
 */
function normalizeContent(content: string): string {
  return content.replace(/\r\n/g, "\n").trim();
}

/**
 * Computes a simplified line diff between two texts
 */
function computeLineDiff(oldText: string, newText: string): {
  additions: number;
  deletions: number;
  snippet: string;
} {
  const oldLines = normalizeContent(oldText).split("\n");
  const newLines = normalizeContent(newText).split("\n");

  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  let additions = 0;
  let deletions = 0;
  const diffLines: string[] = [];

  for (const line of newLines) {
    if (!oldSet.has(line) && line.trim().length > 0) {
      additions++;
      if (diffLines.length < 10) {
        diffLines.push(colors.green(`+ ${line}`));
      }
    }
  }

  for (const line of oldLines) {
    if (!newSet.has(line) && line.trim().length > 0) {
      deletions++;
      if (diffLines.length < 10) {
        diffLines.push(colors.red(`- ${line}`));
      }
    }
  }

  if (diffLines.length >= 10) {
    diffLines.push(colors.gray("  ... (más diferencias omitidas)"));
  }

  return {
    additions,
    deletions,
    snippet: diffLines.join("\n"),
  };
}

/**
 * Scans an existing project, detects existing standards files in root or .github/,
 * compares them with GitHub 2026 templates, and synchronizes them cleanly.
 */
export async function updateStandards(
  options: UpdateOptions = {},
): Promise<UpdateReport> {
  const targetDir = path.resolve(options.targetDir || ".");
  const ctx = await resolveContext(targetDir, options.customContext, {
    lang: options.lang,
    stack: options.stack,
    includeHooks: options.includeHooks,
  });

  const templates: GeneratedFile[] = getAllTemplates(ctx);
  const templateMap = new Map<string, GeneratedFile>();
  for (const t of templates) {
    templateMap.set(t.relativePath, t);
  }

  const report: UpdateReport = {
    targetDir,
    updated: [],
    upToDate: [],
    created: [],
    missing: [],
    skipped: [],
    context: ctx,
    dryRun: !!options.dryRun,
    backupCreated: false,
  };

  // 1. Process candidate mappings (dual-path resolution)
  const processedTemplatePaths = new Set<string>();

  for (const mapping of DUAL_PATH_MAPPINGS) {
    // Find if file exists in any candidate location
    let existingPath: string | null = null;
    for (const cand of mapping.candidates) {
      const fullCand = path.join(targetDir, cand);
      if (await fs.exists(fullCand)) {
        existingPath = cand;
        break;
      }
    }

    // Determine target relative path
    const targetRelative = existingPath || mapping.defaultPath;

    // Find the best template match (e.g. mapping.defaultPath or existingPath)
    const tpl = templateMap.get(targetRelative) ||
      templateMap.get(mapping.defaultPath) ||
      templateMap.get(mapping.candidates[0]);

    if (!tpl) continue;
    processedTemplatePaths.add(tpl.relativePath);

    // If filter files provided, skip if not in list
    if (
      options.files &&
      !options.files.some((f) =>
        targetRelative.includes(f) || tpl.relativePath.includes(f)
      )
    ) {
      continue;
    }

    const fullPath = path.join(targetDir, targetRelative);
    const fileExists = await fs.exists(fullPath);

    if (fileExists) {
      const currentContent = await Deno.readTextFile(fullPath);
      const isIdentical =
        normalizeContent(currentContent) === normalizeContent(tpl.content);

      if (isIdentical) {
        report.upToDate.push({
          relativePath: targetRelative,
          resolvedPath: fullPath,
          status: "up-to-date",
          description: tpl.description,
          additions: 0,
          deletions: 0,
        });
      } else {
        const diff = computeLineDiff(currentContent, tpl.content);

        if (!options.dryRun) {
          if (options.backup) {
            await Deno.copyFile(fullPath, `${fullPath}.bak`);
            report.backupCreated = true;
          }
          await Deno.writeTextFile(fullPath, tpl.content);
        }

        report.updated.push({
          relativePath: targetRelative,
          resolvedPath: fullPath,
          status: "updated",
          description: tpl.description,
          additions: diff.additions,
          deletions: diff.deletions,
          diffSnippet: diff.snippet,
        });
      }
    } else {
      if (options.createMissing) {
        if (!options.dryRun) {
          await fs.ensureDir(path.dirname(fullPath));
          await Deno.writeTextFile(fullPath, tpl.content);
        }
        report.created.push({
          relativePath: targetRelative,
          resolvedPath: fullPath,
          status: "created",
          description: tpl.description,
          additions: tpl.content.split("\n").length,
          deletions: 0,
        });
      } else {
        report.missing.push({
          relativePath: targetRelative,
          resolvedPath: fullPath,
          status: "missing",
          description: tpl.description,
          additions: 0,
          deletions: 0,
        });
      }
    }
  }

  // 2. Process remaining templates (workflows, dependabot, citation, llms, lefthook)
  for (const tpl of templates) {
    if (processedTemplatePaths.has(tpl.relativePath)) continue;

    if (
      options.files &&
      !options.files.some((f) => tpl.relativePath.includes(f))
    ) {
      continue;
    }

    const fullPath = path.join(targetDir, tpl.relativePath);
    const fileExists = await fs.exists(fullPath);

    if (fileExists) {
      const currentContent = await Deno.readTextFile(fullPath);

      // Protect custom user workflows from being overwritten
      const isCustomWorkflow =
        tpl.relativePath.startsWith(".github/workflows/") &&
        !currentContent.includes("@glastor-dev/samurai");

      if (isCustomWorkflow && !options.forceCi) {
        report.skipped.push({
          relativePath: tpl.relativePath,
          resolvedPath: fullPath,
          status: "skipped",
          description:
            "Workflow personalizado preexistente detectado — mantenido intacto para proteger los pipelines del proyecto",
          additions: 0,
          deletions: 0,
        });
        continue;
      }

      const isIdentical =
        normalizeContent(currentContent) === normalizeContent(tpl.content);

      if (isIdentical) {
        report.upToDate.push({
          relativePath: tpl.relativePath,
          resolvedPath: fullPath,
          status: "up-to-date",
          description: tpl.description,
          additions: 0,
          deletions: 0,
        });
      } else {
        const diff = computeLineDiff(currentContent, tpl.content);

        if (!options.dryRun) {
          if (options.backup) {
            await Deno.copyFile(fullPath, `${fullPath}.bak`);
            report.backupCreated = true;
          }
          await Deno.writeTextFile(fullPath, tpl.content);
        }

        report.updated.push({
          relativePath: tpl.relativePath,
          resolvedPath: fullPath,
          status: "updated",
          description: tpl.description,
          additions: diff.additions,
          deletions: diff.deletions,
          diffSnippet: diff.snippet,
        });
      }
    } else {
      if (options.createMissing) {
        if (!options.dryRun) {
          await fs.ensureDir(path.dirname(fullPath));
          await Deno.writeTextFile(fullPath, tpl.content);
        }
        report.created.push({
          relativePath: tpl.relativePath,
          resolvedPath: fullPath,
          status: "created",
          description: tpl.description,
          additions: tpl.content.split("\n").length,
          deletions: 0,
        });
      } else {
        report.missing.push({
          relativePath: tpl.relativePath,
          resolvedPath: fullPath,
          status: "missing",
          description: tpl.description,
          additions: 0,
          deletions: 0,
        });
      }
    }
  }

  return report;
}

/**
 * Pretty prints the update report in terminal
 */
export function printUpdateReport(
  report: UpdateReport,
  options: { showDiff?: boolean } = {},
): void {
  console.log(
    colors.bold(
      colors.cyan("\n🔄 SAMURAI STANDARDS UPDATE & SYNC (GitHub 2026)\n"),
    ),
  );
  console.log(colors.gray(`Directorio objetivo: ${report.targetDir}`));
  console.log(
    colors.gray(
      `Autor detectado / preservado: ${
        colors.green(report.context.authorName)
      } (${report.context.authorEmail})\n`,
    ),
  );

  if (report.dryRun) {
    console.log(
      colors.bold(
        colors.yellow(
          "🔎 MODO PREVIEW / DRY-RUN (No se modificaron archivos en disco)\n",
        ),
      ),
    );
  }

  // 1. Updated files
  if (report.updated.length > 0) {
    console.log(
      colors.bold(
        colors.green(
          `Archivos Actualizados a GitHub 2026 (${report.updated.length}):`,
        ),
      ),
    );
    for (const f of report.updated) {
      const stats = colors.gray(`(+${f.additions} / -${f.deletions} líneas)`);
      console.log(`  🔄 ${colors.bold(f.relativePath)} ${stats}`);
      console.log(`     ${colors.gray(f.description)}`);

      if (options.showDiff && f.diffSnippet) {
        console.log(colors.gray("     Diferencias detectadas:"));
        for (const line of f.diffSnippet.split("\n")) {
          console.log(`       ${line}`);
        }
      }
    }
    console.log();
  }

  // 2. Created files
  if (report.created.length > 0) {
    console.log(
      colors.bold(
        colors.cyan(`Archivos Nuevos Creados (${report.created.length}):`),
      ),
    );
    for (const f of report.created) {
      console.log(`  ✨ ${colors.bold(f.relativePath)}`);
      console.log(`     ${colors.gray(f.description)}`);
    }
    console.log();
  }

  // 3. Up-to-date files
  if (report.upToDate.length > 0) {
    console.log(
      colors.bold(
        colors.blue(
          `Archivos Ya al Día con los Estándares (${report.upToDate.length}):`,
        ),
      ),
    );
    for (const f of report.upToDate) {
      console.log(`  ✅ ${colors.gray(f.relativePath)}`);
    }
    console.log();
  }

  // 4. Missing files
  if (report.missing.length > 0) {
    console.log(
      colors.bold(
        colors.yellow(
          `Archivos de Estándares no instalados en este repo (${report.missing.length}):`,
        ),
      ),
    );
    for (const f of report.missing) {
      console.log(
        `  ⚠️  ${colors.gray(f.relativePath)} ${
          colors.gray("(usa --all para agregarlo)")
        }`,
      );
    }
    console.log();
  }

  // 5. Preserved custom workflows
  if (report.skipped.length > 0) {
    console.log(
      colors.bold(
        colors.magenta(
          `Workflows Preexistentes Preservados (${report.skipped.length}):`,
        ),
      ),
    );
    for (const f of report.skipped) {
      console.log(`  🛡️  ${colors.bold(f.relativePath)}`);
      console.log(`     ${colors.gray(f.description)}`);
    }
    console.log();
  }

  // Summary
  console.log("=".repeat(60));
  console.log(
    `  ${colors.bold("RESUMEN:")} ${
      colors.green(String(report.updated.length))
    } actualizados, ` +
      `${colors.cyan(String(report.created.length))} creados, ` +
      `${colors.blue(String(report.upToDate.length))} al día, ` +
      `${colors.yellow(String(report.missing.length))} omitidos/no-instalados.`,
  );
  if (report.backupCreated) {
    console.log(
      colors.magenta(
        "  📦 Se crearon copias de seguridad (.bak) de los archivos actualizados.",
      ),
    );
  }
  console.log("=".repeat(60) + "\n");
}
