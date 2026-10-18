import { assert, assertEquals } from "@std/assert";
import * as path from "@std/path";
import * as fs from "@std/fs";
import { generateStandards } from "../src/generator.ts";
import {
  getAllTemplates,
  getHybridTemplates,
  getOrgTemplates,
  renderTemplate,
  ROOT_SECURITY_MD,
} from "../src/templates.ts";
import { detectStack } from "../src/detector.ts";
import { runDoctor } from "../src/doctor.ts";

const SAMPLE_CTX = {
  projectName: "SAMURAI-ENGINE",
  repoName: "samurai",
  orgOrUser: "glastor-dev",
  authorName: "Andrés Antonio Cardoso",
  authorEmail: "glastor.info@gmail.com",
  year: "2026",
  defaultBranch: "master",
  repoUrl: "https://github.com/glastor-dev/samurai",
  description: "Enterprise test project",
  license: "Apache-2.0",
  sponsorUser: "glastor-dev",
  sponsorUrl: "https://github.com/sponsors/glastor-dev",
  lang: "en" as const,
};

Deno.test("renderTemplate replaces all placeholders accurately", () => {
  const rendered = renderTemplate(ROOT_SECURITY_MD, SAMPLE_CTX);

  assert(rendered.includes("SAMURAI-ENGINE"));
  assert(rendered.includes("glastor.info@gmail.com"));
  assert(rendered.includes("2026"));
  assert(!rendered.includes("{{PROJECT_NAME}}"));
});

Deno.test("getAllTemplates returns full standalone catalog including Lefthook", () => {
  const all = getAllTemplates(SAMPLE_CTX);
  assertEquals(all.length, 23);
  const paths = all.map((t) => t.relativePath);
  assert(paths.includes("lefthook.yml"));
});

Deno.test("getHybridTemplates returns strictly local infrastructure files", () => {
  const hybrid = getHybridTemplates(SAMPLE_CTX);
  const paths = hybrid.map((t) => t.relativePath);

  // Must have local infrastructure & metadata
  assert(paths.includes("CITATION.cff"));
  assert(paths.includes("CITATION.md"));
  assert(paths.includes("CONTRIBUTORS.md"));
  assert(paths.includes("llms.txt"));
  assert(paths.includes("lefthook.yml"));
  assert(paths.includes(".github/CODEOWNERS"));
  assert(paths.includes(".github/dependabot.yml"));
  assert(paths.includes(".github/workflows/ci.yml"));
  assert(paths.includes(".github/workflows/security-audit.yml"));
  assert(paths.includes(".github/workflows/codeql.yml"));
  assert(paths.includes(".github/workflows/scorecard.yml"));
  assert(paths.includes(".github/workflows/dependabot-automerge.yml"));

  // Must NOT include redundant global org files in child repos
  assert(!paths.includes(".github/CODE_OF_CONDUCT.md"));
  assert(!paths.includes(".github/SUPPORT.md"));
  assert(!paths.includes(".github/FUNDING.yml"));
});

Deno.test("getOrgTemplates returns organization .github bundle templates", () => {
  const org = getOrgTemplates(SAMPLE_CTX);
  assertEquals(org.length, 10);
  const paths = org.map((t) => t.relativePath);
  assert(paths.includes(".github/profile/README.md"));
  assert(paths.includes("CODE_OF_CONDUCT.md"));
  assert(paths.includes("SECURITY.md"));
  assert(paths.includes(".github/FUNDING.yml"));
});

Deno.test("detectStack accurately identifies Rust, Node, Python and Deno", async () => {
  const tempDir = await Deno.makeTempDir({ prefix: "stack_test_" });
  try {
    // Deno
    await Deno.writeTextFile(path.join(tempDir, "deno.json"), "{}");
    let stack = await detectStack(tempDir);
    assertEquals(stack.stack, "deno");

    // Rust
    await Deno.remove(path.join(tempDir, "deno.json"));
    await Deno.writeTextFile(path.join(tempDir, "Cargo.toml"), "[package]");
    stack = await detectStack(tempDir);
    assertEquals(stack.stack, "rust");

    // Node
    await Deno.remove(path.join(tempDir, "Cargo.toml"));
    await Deno.writeTextFile(path.join(tempDir, "package.json"), "{}");
    stack = await detectStack(tempDir);
    assertEquals(stack.stack, "node");

    // Python
    await Deno.remove(path.join(tempDir, "package.json"));
    await Deno.writeTextFile(path.join(tempDir, "pyproject.toml"), "");
    stack = await detectStack(tempDir);
    assertEquals(stack.stack, "python");
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("runDoctor audits current repository and returns A+ grade", async () => {
  const report = await runDoctor(".");
  assert(report.percentage >= 90);
  assert(report.grade.includes("A"));
  assertEquals(report.items.length, 9);
});

Deno.test("generateStandards with English vs Spanish language toggle", () => {
  const esTemplates = getAllTemplates({ ...SAMPLE_CTX, lang: "es" });
  const enTemplates = getAllTemplates({ ...SAMPLE_CTX, lang: "en" });

  const secEs = esTemplates.find((t) => t.relativePath === "SECURITY.md");
  const secEn = enTemplates.find((t) => t.relativePath === "SECURITY.md");

  assert(secEs?.content.includes("Política de Seguridad"));
  assert(secEn?.content.includes("Security Policy"));
});

Deno.test("generateStandards in hybrid mode writes only local repo files", async () => {
  const tempDir = await Deno.makeTempDir({ prefix: "hybrid_test_" });

  try {
    const result = await generateStandards({
      targetDir: tempDir,
      mode: "hybrid",
      force: true,
      customContext: {
        projectName: "HYBRID-REPO",
        repoName: "hybrid-repo",
        orgOrUser: "glastor-dev",
      },
    });

    assertEquals(result.mode, "hybrid");
    assertEquals(result.skipped.length, 0);
    assertEquals(result.written.length, 12);

    // Verify local files exist
    assert(await fs.exists(path.join(tempDir, "CITATION.cff")));
    assert(await fs.exists(path.join(tempDir, "lefthook.yml")));
    assert(await fs.exists(path.join(tempDir, ".github", "dependabot.yml")));
    assert(
      await fs.exists(path.join(tempDir, ".github", "workflows", "ci.yml")),
    );

    // Verify global org files are omitted from child repo
    assert(
      !await fs.exists(path.join(tempDir, ".github", "CODE_OF_CONDUCT.md")),
    );
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("generateStandards in org mode writes organization .github bundle", async () => {
  const tempDir = await Deno.makeTempDir({ prefix: "org_test_" });

  try {
    const result = await generateStandards({
      targetDir: tempDir,
      mode: "org",
      force: true,
      customContext: {
        orgOrUser: "glastor-dev",
      },
    });

    assertEquals(result.mode, "org");
    assertEquals(result.written.length, 10);

    // Verify org profile and global governance exist
    assert(
      await fs.exists(path.join(tempDir, ".github", "profile", "README.md")),
    );
    assert(await fs.exists(path.join(tempDir, "CODE_OF_CONDUCT.md")));
    assert(await fs.exists(path.join(tempDir, "SECURITY.md")));
    assert(await fs.exists(path.join(tempDir, ".github", "FUNDING.yml")));
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});
