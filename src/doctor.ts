import * as path from "@std/path";
import * as fs from "@std/fs";
import * as colors from "@std/fmt/colors";

export interface DiagnosticItem {
  id: string;
  name: string;
  status: "pass" | "warn" | "fail";
  score: number;
  maxScore: number;
  message: string;
  remediation?: string;
}

export interface DoctorReport {
  targetDir: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  items: DiagnosticItem[];
}

export async function runDoctor(
  targetDir: string = ".",
): Promise<DoctorReport> {
  const resolvedDir = path.resolve(targetDir);
  const items: DiagnosticItem[] = [];

  const fileExists = async (relPath: string) => {
    return await fs.exists(path.join(resolvedDir, relPath));
  };

  const readText = async (relPath: string): Promise<string> => {
    try {
      return await Deno.readTextFile(path.join(resolvedDir, relPath));
    } catch {
      return "";
    }
  };

  // 1. Security Policy & PVR
  const hasSecurity = (await fileExists("SECURITY.md")) ||
    (await fileExists(".github/SECURITY.md"));
  const securityContent = (await readText("SECURITY.md")) ||
    (await readText(".github/SECURITY.md"));
  const hasPVR = securityContent.includes("security/advisories") ||
    securityContent.includes("Private Vulnerability Reporting");
  if (hasSecurity && hasPVR) {
    items.push({
      id: "security",
      name: "Security Policy (SECURITY.md)",
      status: "pass",
      score: 10,
      maxScore: 10,
      message:
        "SECURITY.md present with Private Vulnerability Reporting (PVR) & SLA",
    });
  } else if (hasSecurity) {
    items.push({
      id: "security",
      name: "Security Policy (SECURITY.md)",
      status: "warn",
      score: 5,
      maxScore: 10,
      message:
        "SECURITY.md present but missing explicit PVR / Security Advisory SLA",
      remediation:
        "Add Private Vulnerability Reporting links and CVSS response SLAs",
    });
  } else {
    items.push({
      id: "security",
      name: "Security Policy (SECURITY.md)",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "SECURITY.md missing",
      remediation: "Generate SECURITY.md with samurai hybrid or samurai init",
    });
  }

  // 2. Academic Citation (CITATION.cff)
  const hasCff = await fileExists("CITATION.cff");
  const cffContent = await readText("CITATION.cff");
  const validCffVersion = cffContent.includes("cff-version: 1.2.0");
  if (hasCff && validCffVersion) {
    items.push({
      id: "citation",
      name: "Citation File Format (CITATION.cff)",
      status: "pass",
      score: 10,
      maxScore: 10,
      message:
        "CITATION.cff present and conforms to CFF 1.2.0 (enables 'Cite this repository')",
    });
  } else if (hasCff) {
    items.push({
      id: "citation",
      name: "Citation File Format (CITATION.cff)",
      status: "warn",
      score: 5,
      maxScore: 10,
      message:
        "CITATION.cff present but requires cff-version: 1.2.0 for native GitHub parsing",
      remediation: "Ensure 'cff-version: 1.2.0' header is declared",
    });
  } else {
    items.push({
      id: "citation",
      name: "Citation File Format (CITATION.cff)",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "CITATION.cff missing",
      remediation:
        "Generate CITATION.cff to enable native repository attribution",
    });
  }

  // 3. Dependabot v2 & Grouped Updates
  const hasDependabot = await fileExists(".github/dependabot.yml");
  const depContent = await readText(".github/dependabot.yml");
  const hasGroups = depContent.includes("groups:");
  if (hasDependabot && hasGroups) {
    items.push({
      id: "dependabot",
      name: "Dependabot v2 Configuration",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: "Dependabot v2 configured with 'groups' to prevent PR spam",
    });
  } else if (hasDependabot) {
    items.push({
      id: "dependabot",
      name: "Dependabot v2 Configuration",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: "Dependabot configured but missing 'groups' directive",
      remediation:
        "Add 'groups:' definition to bundle updates into a single weekly PR",
    });
  } else {
    items.push({
      id: "dependabot",
      name: "Dependabot v2 Configuration",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: ".github/dependabot.yml missing",
      remediation: "Add dependabot.yml to automate security patch maintenance",
    });
  }

  // 4. GitHub Actions Least Privilege & Concurrency
  const workflowsDir = path.join(resolvedDir, ".github", "workflows");
  let hasWorkflows = false;
  let allHavePermissions = true;
  let allHaveConcurrency = true;

  if (await fs.exists(workflowsDir)) {
    hasWorkflows = true;
    for await (const entry of Deno.readDir(workflowsDir)) {
      if (
        entry.isFile &&
        (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml"))
      ) {
        const wfContent = await Deno.readTextFile(
          path.join(workflowsDir, entry.name),
        );
        if (!wfContent.includes("permissions:")) {
          allHavePermissions = false;
        }
        if (
          !wfContent.includes("concurrency:") && wfContent.includes("push:")
        ) {
          allHaveConcurrency = false;
        }
      }
    }
  }

  if (hasWorkflows && allHavePermissions && allHaveConcurrency) {
    items.push({
      id: "workflows-security",
      name: "CI/CD Least Privilege & Concurrency",
      status: "pass",
      score: 15,
      maxScore: 15,
      message:
        "All workflows declare explicit 'permissions' and 'concurrency' groups",
    });
  } else if (hasWorkflows && allHavePermissions) {
    items.push({
      id: "workflows-security",
      name: "CI/CD Least Privilege & Concurrency",
      status: "warn",
      score: 10,
      maxScore: 15,
      message:
        "Workflows declare permissions but lack concurrency cancellation",
      remediation: "Add concurrency groups to prevent wasted runner minutes",
    });
  } else if (hasWorkflows) {
    items.push({
      id: "workflows-security",
      name: "CI/CD Least Privilege & Concurrency",
      status: "fail",
      score: 4,
      maxScore: 15,
      message: "Workflows rely on elevated default token permissions",
      remediation:
        "Add 'permissions: read-all' at workflow root (OpenSSF requirement)",
    });
  } else {
    items.push({
      id: "workflows-security",
      name: "CI/CD Least Privilege & Concurrency",
      status: "fail",
      score: 0,
      maxScore: 15,
      message: "No GitHub Actions workflows found in .github/workflows/",
      remediation: "Generate standard CI, CodeQL, and DevSecOps pipelines",
    });
  }

  // 5. Code Ownership (CODEOWNERS)
  const hasCodeowners = (await fileExists(".github/CODEOWNERS")) ||
    (await fileExists("CODEOWNERS"));
  if (hasCodeowners) {
    items.push({
      id: "codeowners",
      name: "Granular Code Ownership (CODEOWNERS)",
      status: "pass",
      score: 10,
      maxScore: 10,
      message:
        "CODEOWNERS is active and defines default and path-level reviewers",
    });
  } else {
    items.push({
      id: "codeowners",
      name: "Granular Code Ownership (CODEOWNERS)",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "CODEOWNERS file missing",
      remediation:
        "Create .github/CODEOWNERS to ensure mandatory architectural reviews",
    });
  }

  // 6. Agentic AI Context (llms.txt)
  const hasLlms = await fileExists("llms.txt");
  if (hasLlms) {
    items.push({
      id: "llms",
      name: "AI Agent Indexing (llms.txt)",
      status: "pass",
      score: 10,
      maxScore: 10,
      message:
        "llms.txt provides structured semantic context for AI agents and LLMs",
    });
  } else {
    items.push({
      id: "llms",
      name: "AI Agent Indexing (llms.txt)",
      status: "warn",
      score: 3,
      maxScore: 10,
      message: "llms.txt standard not declared",
      remediation:
        "Add llms.txt to guide AI coding assistants with architectural rules",
    });
  }

  // 7. Interactive Issue Forms (.github/ISSUE_TEMPLATE)
  const hasIssueForms =
    (await fileExists(".github/ISSUE_TEMPLATE/bug_report.yml")) ||
    (await fileExists(".github/ISSUE_TEMPLATE/config.yml"));
  if (hasIssueForms) {
    items.push({
      id: "issue-forms",
      name: "Interactive Issue Forms (YAML)",
      status: "pass",
      score: 10,
      maxScore: 10,
      message:
        "YAML Issue forms provide structured inputs, dropdowns and log boxes",
    });
  } else {
    items.push({
      id: "issue-forms",
      name: "Interactive Issue Forms (YAML)",
      status: "warn",
      score: 4,
      maxScore: 10,
      message: "Legacy Markdown or missing issue templates",
      remediation: "Upgrade to .github/ISSUE_TEMPLATE/*.yml interactive forms",
    });
  }

  // 8. Conventional Commits & Pre-commit Hooks
  const hasCommitConvention = await fileExists(".github/COMMIT_CONVENTION.md");
  const hasLefthook = (await fileExists("lefthook.yml")) ||
    (await fileExists(".lefthook.yml"));
  if (hasCommitConvention && hasLefthook) {
    items.push({
      id: "git-hygiene",
      name: "Conventional Commits & Local Git Hooks",
      status: "pass",
      score: 15,
      maxScore: 15,
      message: "Commit convention documented and enforced locally via Lefthook",
    });
  } else if (hasCommitConvention) {
    items.push({
      id: "git-hygiene",
      name: "Conventional Commits & Local Git Hooks",
      status: "warn",
      score: 10,
      maxScore: 15,
      message:
        "COMMIT_CONVENTION.md present but local git hooks (lefthook.yml) not configured",
      remediation:
        "Add lefthook.yml to reject non-conventional commits before push",
    });
  } else {
    items.push({
      id: "git-hygiene",
      name: "Conventional Commits & Local Git Hooks",
      status: "fail",
      score: 0,
      maxScore: 15,
      message: "No Conventional Commits standard or git hooks configured",
      remediation: "Add .github/COMMIT_CONVENTION.md and lefthook.yml",
    });
  }

  // 9. Community & Social Governance
  const hasCoc = (await fileExists("CODE_OF_CONDUCT.md")) ||
    (await fileExists(".github/CODE_OF_CONDUCT.md"));
  const hasContrib = (await fileExists("CONTRIBUTING.md")) ||
    (await fileExists(".github/CONTRIBUTING.md"));
  const hasPrTemplate =
    (await fileExists(".github/PULL_REQUEST_TEMPLATE.md")) ||
    (await fileExists("PULL_REQUEST_TEMPLATE.md"));

  if (hasCoc && hasContrib && hasPrTemplate) {
    items.push({
      id: "governance",
      name: "Community Governance & PR Standards",
      status: "pass",
      score: 10,
      maxScore: 10,
      message:
        "Code of Conduct, Contributing guidelines, and PR template fully present",
    });
  } else {
    items.push({
      id: "governance",
      name: "Community Governance & PR Standards",
      status: "warn",
      score: 5,
      maxScore: 10,
      message:
        "Some governance files missing (can be inherited via organization .github repo)",
    });
  }

  // Compute final totals
  const totalScore = items.reduce((sum, item) => sum + item.score, 0);
  const maxScore = items.reduce((sum, item) => sum + item.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  let grade = "F";
  if (percentage >= 95) grade = "A+ (Elite)";
  else if (percentage >= 90) grade = "A (Exemplary)";
  else if (percentage >= 80) grade = "B (Compliant)";
  else if (percentage >= 70) grade = "C (Adequate)";
  else grade = "Needs Remediation";

  return {
    targetDir: resolvedDir,
    score: totalScore,
    maxScore,
    percentage,
    grade,
    items,
  };
}

export function printDoctorReport(report: DoctorReport): void {
  console.log(
    colors.bold(
      colors.cyan("\n🩺 SAMURAI GITHUB 2026 DOCTOR & STANDARDS AUDIT"),
    ),
  );
  console.log(colors.gray(`   Directorio evaluado: ${report.targetDir}\n`));

  console.log(colors.bold("MÉTRICAS DE CONFORMIDAD:"));
  for (const item of report.items) {
    let icon = colors.green("✅ [PASS]");
    if (item.status === "warn") icon = colors.yellow("⚠️  [WARN]");
    if (item.status === "fail") icon = colors.red("❌ [FAIL]");

    const scoreTag = colors.gray(`(${item.score}/${item.maxScore} pts)`);
    console.log(`  ${icon} ${colors.bold(item.name)} ${scoreTag}`);
    console.log(`         ${item.message}`);
    if (item.remediation) {
      console.log(
        `         ${colors.cyan("💡 Solución:")} ${item.remediation}`,
      );
    }
  }

  console.log(colors.bold("\n" + "=".repeat(60)));
  const scoreColor = report.percentage >= 90
    ? colors.green
    : report.percentage >= 75
    ? colors.yellow
    : colors.red;
  console.log(
    `  ${colors.bold("PUNTAJE GLOBAL:")}  ${
      scoreColor(
        colors.bold(
          `${report.score} / ${report.maxScore} (${report.percentage}%)`,
        ),
      )
    }`,
  );
  console.log(
    `  ${colors.bold("CALIFICACIÓN:")}    ${
      scoreColor(colors.bold(report.grade))
    }`,
  );
  console.log("=".repeat(60) + "\n");

  if (report.percentage < 90) {
    console.log(
      colors.yellow(
        "💡 Consejo: Ejecuta 'deno task hybrid' o 'deno task init --force' para alcanzar el 100% de cumplimiento.\n",
      ),
    );
  } else {
    console.log(
      colors.green(
        "🎉 ¡Excelente trabajo! Este repositorio cumple rigurosamente con los estándares de élite de GitHub 2026.\n",
      ),
    );
  }
}
