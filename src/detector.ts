import * as path from "@std/path";
import * as fs from "@std/fs";

export type TechStack = "deno" | "rust" | "node" | "python" | "go" | "generic";

export interface StackConfig {
  stack: TechStack;
  displayName: string;
  testCmd: string;
  lintCmd: string;
  fmtCmd: string;
  dependabotEcosystems: string[];
  codeqlLanguages: string[];
  setupActionSnippet: string;
}

export const STACK_CONFIGS: Record<TechStack, StackConfig> = {
  deno: {
    stack: "deno",
    displayName: "Deno / TypeScript",
    testCmd: "deno test -A",
    lintCmd: "deno lint",
    fmtCmd: "deno fmt --check",
    dependabotEcosystems: ["github-actions"],
    codeqlLanguages: ["javascript-typescript"],
    setupActionSnippet: `      - name: Setup Deno Environment
        uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Format & Lint Verification
        run: |
          deno fmt --check
          deno lint

      - name: Run Test Suite
        run: |
          deno test -A`,
  },
  rust: {
    stack: "rust",
    displayName: "Rust / Cargo",
    testCmd: "cargo test --all",
    lintCmd: "cargo clippy -- -D warnings",
    fmtCmd: "cargo fmt -- --check",
    dependabotEcosystems: ["cargo", "github-actions"],
    codeqlLanguages: ["rust"],
    setupActionSnippet: `      - name: Setup Rust Toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt

      - name: Cache Cargo Dependencies
        uses: Swatinem/rust-cache@v2

      - name: Code Formatting & Clippy Linter
        run: |
          cargo fmt -- --check
          cargo clippy -- -D warnings

      - name: Run Rust Test Suite
        run: cargo test --all`,
  },
  node: {
    stack: "node",
    displayName: "Node.js / TypeScript",
    testCmd: "npm test",
    lintCmd: "npm run lint",
    fmtCmd: "npx prettier --check .",
    dependabotEcosystems: ["npm", "github-actions"],
    codeqlLanguages: ["javascript-typescript"],
    setupActionSnippet: `      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Lint & Code Style Verification
        run: |
          npm run lint --if-present

      - name: Run Test Suite
        run: npm test --if-present`,
  },
  python: {
    stack: "python",
    displayName: "Python",
    testCmd: "pytest",
    lintCmd: "ruff check .",
    fmtCmd: "ruff format --check .",
    dependabotEcosystems: ["pip", "github-actions"],
    codeqlLanguages: ["python"],
    setupActionSnippet: `      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install Tooling & Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install ruff pytest
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

      - name: Linting with Ruff
        run: ruff check .

      - name: Run Pytest
        run: pytest`,
  },
  go: {
    stack: "go",
    displayName: "Go (Golang)",
    testCmd: "go test -v ./...",
    lintCmd: "golangci-lint run",
    fmtCmd: "gofmt -l .",
    dependabotEcosystems: ["gomod", "github-actions"],
    codeqlLanguages: ["go"],
    setupActionSnippet: `      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Run Go Formatter Verification
        run: |
          if [ -n "$(gofmt -l .)" ]; then echo "Unformatted Go code detected"; exit 1; fi

      - name: Run Go Tests
        run: go test -v -race ./...`,
  },
  generic: {
    stack: "generic",
    displayName: "Multi-language / Universal",
    testCmd: "echo 'No tests configured'",
    lintCmd: "echo 'No linter configured'",
    fmtCmd: "echo 'No formatter configured'",
    dependabotEcosystems: ["github-actions"],
    codeqlLanguages: ["javascript-typescript"],
    setupActionSnippet: `      - name: Run Validation Checks
        run: echo "Universal validation completed"`,
  },
};

/**
 * Automatically inspects repository markers to detect active runtime stack
 */
export async function detectStack(targetDir: string): Promise<StackConfig> {
  const check = async (relPath: string) => {
    return await fs.exists(path.join(targetDir, relPath));
  };

  // Priority detection
  if (await check("Cargo.toml")) {
    return STACK_CONFIGS.rust;
  }

  if (await check("deno.json") || await check("deno.jsonc")) {
    return STACK_CONFIGS.deno;
  }

  if (
    await check("package.json") || await check("pnpm-lock.yaml") ||
    await check("bun.lockb") || await check("yarn.lock")
  ) {
    return STACK_CONFIGS.node;
  }

  if (
    await check("pyproject.toml") || await check("requirements.txt") ||
    await check("Pipfile") || await check("setup.py")
  ) {
    return STACK_CONFIGS.python;
  }

  if (await check("go.mod")) {
    return STACK_CONFIGS.go;
  }

  return STACK_CONFIGS.deno; // Default to Deno if ambiguous
}
