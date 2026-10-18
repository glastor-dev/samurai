import * as path from "@std/path";
import * as fs from "@std/fs";
import {
  type GeneratedFile,
  getAllTemplates,
  getHybridTemplates,
  getOrgTemplates,
  type TemplateContext,
} from "./templates.ts";
import { detectStack, STACK_CONFIGS, type TechStack } from "./detector.ts";

export type GenerationMode = "standalone" | "hybrid" | "org";

export interface GeneratorOptions {
  targetDir?: string;
  force?: boolean;
  dryRun?: boolean;
  mode?: GenerationMode;
  lang?: "en" | "es";
  stack?: TechStack | "auto";
  includeHooks?: boolean;
  categories?: Array<"root" | "governance" | "issues" | "workflows">;
  customContext?: Partial<TemplateContext>;
}

export interface GenerationResult {
  total: number;
  written: string[];
  skipped: string[];
  dryRun: boolean;
  mode: GenerationMode;
  context: TemplateContext;
}

/**
 * Detects git details from the local repository
 */
export async function detectGitContext(
  targetDir: string,
): Promise<Partial<TemplateContext>> {
  const result: Partial<TemplateContext> = {};

  try {
    const run = async (args: string[]): Promise<string> => {
      const command = new Deno.Command("git", {
        args,
        cwd: targetDir,
        stdout: "piped",
        stderr: "null",
      });
      const output = await command.output();
      if (!output.success) return "";
      return new TextDecoder().decode(output.stdout).trim();
    };

    const userName = await run(["config", "user.name"]);
    const userEmail = await run(["config", "user.email"]);
    const remoteUrl = await run(["config", "--get", "remote.origin.url"]);
    const branch = await run(["branch", "--show-current"]);

    if (userName) result.authorName = userName;
    if (userEmail) {
      result.authorEmail = userEmail;
    }
    if (branch) result.defaultBranch = branch;

    if (remoteUrl) {
      // Parse git remote (https://github.com/org/repo.git or git@github.com:org/repo.git)
      const httpsMatch = remoteUrl.match(
        /github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?/,
      );
      if (httpsMatch) {
        result.orgOrUser = httpsMatch[1];
        result.repoName = httpsMatch[2];
        result.repoUrl = `https://github.com/${httpsMatch[1]}/${httpsMatch[2]}`;
      }
    }
  } catch {
    // Git might not be initialized or available
  }

  return result;
}

/**
 * Resolves full TemplateContext merging detected git info, defaults and user overrides
 */
export async function resolveContext(
  targetDir: string,
  overrides: Partial<TemplateContext> = {},
  options: {
    lang?: "en" | "es";
    stack?: TechStack | "auto";
    includeHooks?: boolean;
  } = {},
): Promise<TemplateContext> {
  const detected = await detectGitContext(targetDir);
  const dirBasename = path.basename(path.resolve(targetDir)) || "my-project";

  const detectedStack = await detectStack(targetDir);
  const activeStack = (options.stack && options.stack !== "auto")
    ? STACK_CONFIGS[options.stack] || detectedStack
    : detectedStack;

  const orgOrUser = overrides.orgOrUser || detected.orgOrUser || "glastor-dev";
  const repoName = overrides.repoName || detected.repoName || dirBasename;
  const authorName = overrides.authorName || detected.authorName ||
    "Andrés Antonio Cardoso";
  const authorEmail = overrides.authorEmail || detected.authorEmail ||
    "glastor.info@gmail.com";
  const defaultBranch = overrides.defaultBranch || detected.defaultBranch ||
    "master";
  const year = overrides.year || new Date().getFullYear().toString();
  const repoUrl = overrides.repoUrl || detected.repoUrl ||
    `https://github.com/${orgOrUser}/${repoName}`;

  return {
    projectName: overrides.projectName || repoName.toUpperCase(),
    repoName,
    orgOrUser,
    authorName,
    authorEmail,
    year,
    defaultBranch,
    repoUrl,
    description: overrides.description ||
      `Enterprise-grade software repository adhering to GitHub 2026 standards and DevSecOps architecture.`,
    license: overrides.license || "Apache-2.0",
    sponsorUser: overrides.sponsorUser || orgOrUser,
    sponsorUrl: overrides.sponsorUrl ||
      `https://github.com/sponsors/${orgOrUser}`,
    lang: options.lang || overrides.lang || "en",
    stack: activeStack.stack,
    stackDisplayName: activeStack.displayName,
    testCommand: activeStack.testCmd,
    fmtCommand: activeStack.fmtCmd,
    lintCommand: activeStack.lintCmd,
    dependabotEcosystems: activeStack.dependabotEcosystems,
    codeqlLanguages: activeStack.codeqlLanguages,
    setupActionSnippet: activeStack.setupActionSnippet,
    includeHooks: options.includeHooks ?? overrides.includeHooks ?? true,
  };
}

/**
 * Generates standards documentation and workflow files
 */
export async function generateStandards(
  options: GeneratorOptions = {},
): Promise<GenerationResult> {
  const targetDir = path.resolve(options.targetDir || ".");
  const ctx = await resolveContext(targetDir, options.customContext, {
    lang: options.lang,
    stack: options.stack,
    includeHooks: options.includeHooks,
  });
  const mode: GenerationMode = options.mode || "standalone";

  let templates: GeneratedFile[];
  if (mode === "hybrid") {
    templates = getHybridTemplates(ctx);
  } else if (mode === "org") {
    templates = getOrgTemplates(ctx);
  } else {
    templates = getAllTemplates(ctx);
  }

  const selectedCategories = options.categories ||
    ["root", "governance", "issues", "workflows"];
  const filteredTemplates = templates.filter((t) =>
    selectedCategories.includes(t.category)
  );

  const written: string[] = [];
  const skipped: string[] = [];

  for (const item of filteredTemplates) {
    const fullPath = path.join(targetDir, item.relativePath);
    const exists = await fs.exists(fullPath);

    if (exists && !options.force) {
      skipped.push(item.relativePath);
      continue;
    }

    if (!options.dryRun) {
      await fs.ensureDir(path.dirname(fullPath));
      await Deno.writeTextFile(fullPath, item.content);
    }

    written.push(item.relativePath);
  }

  return {
    total: filteredTemplates.length,
    written,
    skipped,
    dryRun: !!options.dryRun,
    mode,
    context: ctx,
  };
}
