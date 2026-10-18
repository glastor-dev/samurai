/**
 * English versions of Enterprise Governance & Community Health templates (GitHub 2026 standard)
 */

export const ROOT_SECURITY_MD_EN = `# 🛡️ Security Policy

## Responsible Disclosure & Supply Chain Security

The security, integrity, and resilience of the **{{PROJECT_NAME}}** software supply chain is an absolute priority. We appreciate the efforts of the open-source community and independent security researchers in discovering and responsibly reporting vulnerabilities.

---

## 🔒 Supported Versions

We actively maintain security patches for the following releases and branches:

| Version | Status | Maintenance Policy |
| :--- | :---: | :--- |
| **Latest (main / {{DEFAULT_BRANCH}})** | ✅ Supported | Immediate security patches and automated dependency updates |
| **Previous Major (v-1.x)** | 🛡️ Critical Only | Patches for high/critical vulnerabilities (CVSS ≥ 7.0) |
| **Legacy (< v-1.x)** | ❌ End of Life | Unsupported. Upgrade required |

---

## 🚨 Reporting a Vulnerability

> ⚠️ **IMPORTANT:** **DO NOT** open public GitHub Issues or public pull requests for security vulnerabilities that could compromise production systems.

### Preferred Channel: GitHub Private Vulnerability Reporting (PVR)
Please report vulnerabilities using GitHub's native confidential reporting tool:
1. Navigate to the **Security** tab of this repository: [{{REPO_URL}}/security/advisories]({{REPO_URL}}/security/advisories).
2. Click **Report a vulnerability**.
3. Fill out the advisory form with technical details and reproducible proof-of-concept (PoC).

### Alternative Direct Channel:
If Private Vulnerability Reporting is unavailable:
- **Security Contact:** [{{AUTHOR_EMAIL}}](mailto:{{AUTHOR_EMAIL}})
- **Subject:** \`[SECURITY-ALERT] {{REPO_NAME}} - Vulnerability Report\`

---

## ⏱️ Service Level Agreements (SLAs)
- **Initial Response & Acknowledgment:** Within **24 to 48 business hours**.
- **Triage & CVSS Assessment:** Within **5 business days**.
- **Coordinated Disclosure:** We adhere to a **90-day grace period** to allow patch deployment before public CVE disclosure.

---

© 2010-{{YEAR}} {{AUTHOR_NAME}} - All rights reserved.
`;

export const CONTRIBUTORS_MD_EN =
  `## 🤝 Governance, Scalability & Technical Sustainability

![Contributors](https://img.shields.io/github/contributors/{{ORG_OR_USER}}/{{REPO_NAME}}) ![Stars](https://img.shields.io/github/stars/{{ORG_OR_USER}}/{{REPO_NAME}})

\`**{{PROJECT_NAME}}** powered by {{ORG_OR_USER}}\` is a high-performance engineering ecosystem built to scale. Our architecture rests on two pillars: world-class human talent and technical sustainability ensuring continuous core evolution.

### 👥 Engineering Leadership & Direction

- **{{AUTHOR_NAME}}** ([@{{ORG_OR_USER}}](https://github.com/{{ORG_OR_USER}}))
  - *Lead Software Architect & Maintainer*
  - Responsible for strategic roadmap, architectural integrity, and technical governance.

---

### 🚀 Developer Experience (DX-First) Contribution

Looking to elevate the standard of open-source software? Review our [Contribution Guide (.github/CONTRIBUTING.md)](.github/CONTRIBUTING.md). We maintain rigorous CI/CD standards and peer review focused on long-term maintainability.

---

### 💡 Sustainability Roadmap & Sponsorship

Continuous innovation and robust infrastructure require resources. Sponsorship is an investment in the stability of tools powering your technology stack:

- **Strategic Sponsorship:** [GitHub Sponsors](https://github.com/sponsors/{{SPONSOR_USER}}) (Priority support & brand visibility).
- **Operations Fund:** [Sponsor Link]({{SPONSOR_URL}}) for direct contributions.
- **Market Validation:** ⭐ [Star this repository]({{REPO_URL}}) to increase ecosystem visibility.

© 2010-{{YEAR}} {{AUTHOR_NAME}} - All rights reserved.
`;

export const GITHUB_CODE_OF_CONDUCT_EN =
  `# ⚖️ Code of Conduct & Governance Protocol

## 1. The DX Standard and Human Excellence
\`**{{PROJECT_NAME}}** led by {{ORG_OR_USER}}\` is not just code; it is a high-performance engineering ecosystem. Our mission is to build robust solutions while maintaining an exceptional Developer Experience (DX). This protocol ensures collaboration is predictable, respectful, and focused on technical excellence.

---

## 2. Pillars of Sustainable Software Engineering

### 🤝 High-Impact Collaboration
- **Technical Empathy & Peer Review:** We approach code reviews and architectural debates with technical rigor and professional courtesy. Code quality supersedes personal ego.
- **Transparent Accountability:** We acknowledge mistakes immediately, transforming them into automated tests, optimizations, and documentation.
- **Data-Driven Feedback:** Architectural proposals must be backed by benchmarks, open standards, and proven patterns.

### 🚫 Zero Tolerance
- **Harassment & Discrimination:** Any derogatory language, discriminatory behavior, or toxic conduct will result in immediate suspension.
- **Trolling & Derailing:** Spam and disruptive interference in issues or pull requests degrade productivity and will be moderated.
- **Doxxing:** Sharing private personal details or credentials results in permanent expulsion.

---

## 3. Artificial Intelligence & Code Integrity (GitHub 2026)
- **Transparency in AI Contributions:** Substantial contributions generated or assisted by Large Language Models (LLMs) or autonomous coding agents must be explicitly declared in the Pull Request description.
- **IP & License Compliance:** Contributors are strictly responsible for verifying that AI-assisted code does not reproduce copyrighted code or violate third-party open-source licenses.

---

## 4. Incident Response Protocol
To report an ethics or conduct violation:
- 📩 **Integrity Channel:** [{{AUTHOR_EMAIL}}](mailto:{{AUTHOR_EMAIL}})
- **Response SLA:** The maintainers will acknowledge and process reports within **48 to 72 business hours** under strict confidentiality.

© 2010-{{YEAR}} {{AUTHOR_NAME}} - All rights reserved.
`;

export const GITHUB_COMMIT_CONVENTION_EN =
  `# 📐 Commit Message Architecture (Conventional Commits)

To scale development and maintain a transparent software supply chain, this repository enforces the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification. This practice deterministically drives automated changelogs, Semantic Versioning (SemVer), and DevSecOps traceability.

---

## 🔍 Validation Specification

Every commit must pass the following regular expression before integration into \`{{DEFAULT_BRANCH}}\`:

\`\`\`js
/^(revert: )?(feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types)(\\([\\w.-]+\\))?: .{1,50}$/
\`\`\`

### Commit Structure:

\`\`\`text
<type>(<scope>): <short description>

<detailed body explaining technical motivation and impact>

<footer>
\`\`\`

| Type | SemVer Impact / Description | Included in Changelog? |
| :--- | :--- | :---: |
| \`feat\` | New user-facing feature or capability. | **Yes (Minor)** |
| \`fix\` | Bug fix or regression patch. | **Yes (Patch)** |
| \`perf\` | Performance optimization or resource reduction. | **Yes** |
| \`refactor\` | Code restructuring without behavioral change. | No |
| \`docs\` | Technical documentation updates. | No |
| \`test\` | Unit or integration test additions. | No |
| \`ci\` / \`workflow\` | CI/CD pipeline and automation changes. | No |
| \`chore\` | Tooling, dependencies, or metadata maintenance. | No |

> 💥 **Breaking Changes:** Any commit containing \`BREAKING CHANGE:\` in the footer automatically triggers a **Major Release**.

---

## 🔐 Cryptographic Commit Signing (Verified Badge)

In accordance with GitHub supply-chain security guidelines, all commits should be cryptographically signed using **SSH** or **GPG** keys.

© 2010-{{YEAR}} {{AUTHOR_NAME}} - All rights reserved.
`;

export const GITHUB_CONTRIBUTING_EN = `# 🚀 Contributing Guidelines & Standards

Thank you for contributing to **{{PROJECT_NAME}}**. We value technical excellence, architectural rigor, and clean engineering practices.

---

## 🛠️ Pull Request Workflow

1. **Semantic Branching:**
   \`\`\`bash
   git checkout -b feat/your-feature-name
   # or fix/issue-description
   \`\`\`

2. **Local Verification:**
   Ensure formatting, linter, and tests pass with zero warnings before opening a PR:
   \`\`\`bash
   {{TEST_COMMAND}}
   \`\`\`

3. **Conventional Commits:**
   Follow [.github/COMMIT_CONVENTION.md](COMMIT_CONVENTION.md):
   \`\`\`bash
   git commit -m "feat(core): implement deterministic schema validation"
   \`\`\`

4. **Open Pull Request:**
   Submit your branch against \`{{DEFAULT_BRANCH}}\` with the completed PR checklist.

---

## 📐 Engineering Principles
- **Clean Code & SOLID:** Modular, pure functions, and strict typing without unjustified \`any\`.
- **Atomic Pull Requests:** One PR solves one discrete responsibility.
- **Docs Parity:** Every API modification must include corresponding documentation updates.

© 2010-{{YEAR}} {{AUTHOR_NAME}} - All rights reserved.
`;

export const GITHUB_SUPPORT_EN = `## 🤝 Support & Ecosystem Guidelines

To ensure the scalability of **{{PROJECT_NAME}}** and maintain world-class Developer Experience (DX), please use our official support channels:

---

### 💬 Community & Architectural Discussions
For usage questions, roadmap discussions, and technical brainstorming:
- **[GitHub Discussions]({{REPO_URL}}/discussions):** Ideal for open technical dialogue.

### 🐛 Issue Triage & Bug Reports
For reproducible defects or formal capability requests:
- **[Open a GitHub Issue]({{REPO_URL}}/issues):** Please provide environment details, minimal reproduction scripts, and logs.

### 🛡️ Private Security Disclosure
Do not report critical vulnerabilities in public tickets:
1. Consult our **[Security Policy]({{REPO_URL}}/security/policy)**.
2. Submit a confidential report via **[Security Advisories]({{REPO_URL}}/security/advisories)** or email [{{AUTHOR_EMAIL}}](mailto:{{AUTHOR_EMAIL}}).

© 2010-{{YEAR}} {{AUTHOR_NAME}} - All rights reserved.
`;

export const GITHUB_PULL_REQUEST_TEMPLATE_EN = `## 📋 Summary of Changes
<!-- Briefly describe the technical motivation and scope of this pull request -->

Closes #<!-- Issue number if applicable, e.g. Closes #42 -->

---

## 🏷️ Type of Change
- [ ] 🐛 **Fix:** Bug fix or regression resolution.
- [ ] ✨ **Feat:** New feature or functional enhancement.
- [ ] ⚡ **Perf:** Performance or memory optimization.
- [ ] ♻️ **Refactor:** Code restructuring without behavioral change.
- [ ] 📚 **Docs:** Documentation or specification update.
- [ ] 🧪 **Test:** Added or improved automated tests.
- [ ] 🔧 **CI/Chore:** Pipeline, tooling, or dependency updates.

---

## 🔍 Quality & DevSecOps Checklist
- [ ] Commit messages follow [Conventional Commits](.github/COMMIT_CONVENTION.md).
- [ ] Code passes style formatting and lint checks.
- [ ] Added or updated automated tests covering new behavior.
- [ ] All existing automated tests continue to pass.
- [ ] **Breaking Changes:** If introducing breaking changes, documented in footer and explained below.
- [ ] **AI Transparency:** If code was assisted by LLMs, verified correctness, originality, and license compliance.

---

## 💥 Breaking Changes & Migration Notes
<!-- If applicable, detail required migration steps. Otherwise write "N/A" -->
`;

export const LEFTHOOK_YML =
  `# ==============================================================================
# Lefthook Git Hooks Configuration (GitHub 2026 Standard)
# Enforces Conventional Commits and code quality locally before push
# Reference: https://github.com/evilmartians/lefthook
# ==============================================================================

pre-commit:
  parallel: true
  commands:
    quality-check:
      run: {{FMT_COMMAND}}

commit-msg:
  commands:
    conventional-commits:
      run: |
        head -n 1 {1} | grep -Eq '^(revert: )?(feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types)(\\([\\w.-]+\\))?: .{1,50}$' || {
          echo "❌ [ERROR] Invalid commit message format."
          echo "   Expected: <type>(<scope>): <subject (max 50 chars)>"
          echo "   Example:  feat(core): add deterministic schema validator"
          echo "   See:      .github/COMMIT_CONVENTION.md"
          exit 1
        }
`;
