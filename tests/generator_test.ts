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

const SAMPLE_CTX = {
  projectName: "SAMURAI-ENGINE",
  repoName: "samurai",
  orgOrUser: "glastor-dev",
  authorName: "Andrés Antonio Cardoso",
  authorEmail: "glastor.info@gmail.com",
  year: "2026",
  defaultBranch: "main",
  repoUrl: "https://github.com/glastor-dev/samurai",
  description: "Enterprise test project",
  license: "Apache-2.0",
  sponsorUser: "glastor-dev",
  sponsorUrl: "https://github.com/sponsors/glastor-dev",
};

Deno.test("renderTemplate replaces all placeholders accurately", () => {
  const rendered = renderTemplate(ROOT_SECURITY_MD, SAMPLE_CTX);

  assert(rendered.includes("SAMURAI-ENGINE"));
  assert(rendered.includes("glastor.info@gmail.com"));
  assert(rendered.includes("2026"));
  assert(!rendered.includes("{{PROJECT_NAME}}"));
});

Deno.test("getAllTemplates returns full standalone catalog of 22 files", () => {
  const all = getAllTemplates(SAMPLE_CTX);
  assertEquals(all.length, 22);
});

Deno.test("getHybridTemplates returns strictly local infrastructure files", () => {
  const hybrid = getHybridTemplates(SAMPLE_CTX);
  const paths = hybrid.map((t) => t.relativePath);

  // Must have local infrastructure & metadata
  assert(paths.includes("CITATION.cff"));
  assert(paths.includes("CITATION.md"));
  assert(paths.includes("CONTRIBUTORS.md"));
  assert(paths.includes("llms.txt"));
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

Deno.test("getOrgTemplates returns organization .github repo bundle with Mermaid profile", () => {
  const org = getOrgTemplates(SAMPLE_CTX);
  const paths = org.map((t) => t.relativePath);

  assert(paths.includes(".github/profile/README.md"));
  assert(paths.includes("CODE_OF_CONDUCT.md"));
  assert(paths.includes("CONTRIBUTING.md"));
  assert(paths.includes("SECURITY.md"));
  assert(paths.includes("SUPPORT.md"));
  assert(paths.includes(".github/FUNDING.yml"));
  assert(paths.includes(".github/PULL_REQUEST_TEMPLATE.md"));
  assert(paths.includes(".github/ISSUE_TEMPLATE/bug_report.yml"));

  // Check that the profile README contains the Mermaid architecture diagram
  const profileReadme = org.find((t) =>
    t.relativePath === ".github/profile/README.md"
  );
  assert(profileReadme);
  assert(profileReadme.content.includes("mermaid"));
  assert(profileReadme.content.includes("glastor-dev"));
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
    assertEquals(result.written.length, 11);

    // Verify local files exist
    assert(await fs.exists(path.join(tempDir, "CITATION.cff")));
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
