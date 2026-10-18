/**
 * Embedded templates for Enterprise GitHub Standards & Community Health (2026 specification)
 * Based on https://github.com/glastor-dev/glastor-dev architecture.
 */

export interface TemplateContext {
  projectName: string;
  repoName: string;
  orgOrUser: string;
  authorName: string;
  authorEmail: string;
  year: string;
  defaultBranch: string;
  repoUrl: string;
  description: string;
  license: string;
  sponsorUser: string;
  sponsorUrl: string;
}

export interface GeneratedFile {
  relativePath: string;
  content: string;
  category: "root" | "governance" | "issues" | "workflows";
  description: string;
}

export function renderTemplate(template: string, ctx: TemplateContext): string {
  return template
    .replaceAll("{{PROJECT_NAME}}", ctx.projectName)
    .replaceAll("{{REPO_NAME}}", ctx.repoName)
    .replaceAll("{{ORG_OR_USER}}", ctx.orgOrUser)
    .replaceAll("{{AUTHOR_NAME}}", ctx.authorName)
    .replaceAll("{{AUTHOR_EMAIL}}", ctx.authorEmail)
    .replaceAll("{{YEAR}}", ctx.year)
    .replaceAll("{{DEFAULT_BRANCH}}", ctx.defaultBranch)
    .replaceAll("{{REPO_URL}}", ctx.repoUrl)
    .replaceAll("{{DESCRIPTION}}", ctx.description)
    .replaceAll("{{LICENSE}}", ctx.license)
    .replaceAll("{{SPONSOR_USER}}", ctx.sponsorUser)
    .replaceAll("{{SPONSOR_URL}}", ctx.sponsorUrl);
}

// ---------------------------------------------------------------------------
// 1. Root Templates
// ---------------------------------------------------------------------------

export const ROOT_SECURITY_MD = `# 🛡️ Política de Seguridad (Security Policy)

## Compromiso de Seguridad y Divulgación Responsable

La seguridad, integridad y resiliencia de la **Software Supply Chain** de **{{PROJECT_NAME}}** es una prioridad institucional absoluta. Agradecemos el esfuerzo de la comunidad y de investigadores de seguridad independientes por reportar vulnerabilidades de manera ética y confidencial.

---

## 🔒 Versiones con Soporte Activo

Mantenemos activamente parches de seguridad para las siguientes ramas y versiones:

| Versión | Estado de Soporte | Tipo de Mantenimiento |
| :--- | :---: | :--- |
| **Latest (main / {{DEFAULT_BRANCH}})** | ✅ Activo | Parches inmediatos de seguridad y dependencias |
| **Versión mayor anterior (v-1.x)** | 🛡️ Crítico | Parches de vulnerabilidades severas (CVSS ≥ 7.0) |
| **Versiones heredadas (< v-1.x)** | ❌ Sin Soporte | Fin del ciclo de vida (EOL). Migración requerida |

---

## 🚨 Protocolo para Reportar Vulnerabilidades

> ⚠️ **IMPORTANTE:** **NO** abras un ticket público en GitHub Issues para reportar vulnerabilidades de seguridad que puedan comprometer la confidencialidad, integridad o disponibilidad de sistemas en producción.

### Canal Preferido: GitHub Private Vulnerability Reporting (PVR)
Utiliza la herramienta nativa de GitHub para apertura segura y cifrada de reportes:
1. Dirígete a la pestaña **Security** del repositorio: [{{REPO_URL}}/security/advisories]({{REPO_URL}}/security/advisories).
2. Haz clic en **Report a vulnerability**.
3. Completa los detalles técnicos, vector de ataque y prueba de concepto (PoC).

### Canal Alternativo Directo:
Si no dispones de cuenta con acceso a Security Advisories o requieres cifrado PGP/GPG:
- **Email de Seguridad:** [{{AUTHOR_EMAIL}}](mailto:{{AUTHOR_EMAIL}})
- **Asunto:** \`[SECURITY-ALERT] {{REPO_NAME}} - CVE / Vulnerabilidad\`

---

## 📋 Requisitos para el Reporte Técnico
Para acelerar el triaje y la remediación, incluye:
1. **Descripción del impacto:** Severidad estimada según métricas **CVSS v3.1 / v4.0**.
2. **Pasos para reproducir:** Prueba de concepto determinista (script mínimo, payload o secuencia HTTP).
3. **Entorno afectado:** Sistema Operativo, Runtime, versiones específicas afectadas.
4. **Propuesta de remediación (opcional):** Parche o mitigación temporal si está disponible.

---

## ⏱️ Acuerdos de Nivel de Servicio (SLA)
- **Acuse de recibo inicial:** Dentro de las **24 a 48 horas hábiles**.
- **Evaluación y triaje:** Dentro de los **5 días hábiles**.
- **Coordinación de divulgación:** Fijamos un período de gracia de **90 días** para publicar el parche y notificar a los usuarios antes de cualquier divulgación pública coordinada.

---

© {{YEAR}} {{AUTHOR_NAME}} - Todos los derechos reservados.
`;

export const CONTRIBUTORS_MD =
  `## 🤝 Gobernanza, Escalabilidad y Sostenibilidad Técnica

![Contributors](https://img.shields.io/github/contributors/{{ORG_OR_USER}}/{{REPO_NAME}}) ![Stars](https://img.shields.io/github/stars/{{ORG_OR_USER}}/{{REPO_NAME}})

\`**{{PROJECT_NAME}}** impulsado por {{ORG_OR_USER}}\` no es solo un repositorio; es un ecosistema de ingeniería de alto rendimiento diseñado para escalar. Nuestra arquitectura se sustenta en dos pilares críticos: la excelencia del talento humano y un modelo de sostenibilidad técnica y financiera que garantiza la evolución constante del core.

### 👥 Liderazgo y Dirección de Ingeniería

El desarrollo de este sistema es coordinado por profesionales comprometidos con los estándares más exigentes de la industria.

- **{{AUTHOR_NAME}}** ([@{{ORG_OR_USER}}](https://github.com/{{ORG_OR_USER}}))
  - *Lead Software Architect & Project Maintainer*
  - Responsable del roadmap estratégico, la gobernanza técnica y la integridad de la arquitectura.

---

### 🚀 Framework de Contribución (DX-Focused)

¿Buscas elevar el estándar del software libre con nosotros? Incentivamos una **Developer Experience (DX)** superior. Si deseas integrar nuevas funcionalidades u optimizar el rendimiento, revisa nuestra [Guía de Contribución (.github/CONTRIBUTING.md)](.github/CONTRIBUTING.md). Aplicamos flujos de CI/CD rigurosos y revisiones de código basadas en mantenibilidad a largo plazo.

---

### 💡 Roadmap de Sostenibilidad e Inversión

La innovación continua y el mantenimiento de una infraestructura robusta requieren recursos. Tu patrocinio no es una donación; es una inversión en la estabilidad de una herramienta que potencia tu stack tecnológico.

- **Patrocinio Estratégico:** [GitHub Sponsors](https://github.com/sponsors/{{SPONSOR_USER}}) (Soporte prioritario y visibilidad de marca).
- **Fondo de Operaciones:** [Sponsors Link]({{SPONSOR_URL}}) para contribuciones directas.
- **Validación de Mercado:** ⭐ [Star este repositorio]({{REPO_URL}}) para incrementar nuestra tracción y visibilidad en el ecosistema open source.

---

### 🛡️ Ecosistema de Reconocimiento

Agradecemos a las entidades y profesionales que validan nuestro rigor técnico:
- **Security Researchers:** Por auditar proactivamente la robustez de nuestro código.
- **Early Adopters:** Por la validación en entornos de producción reales.
- **Comunidad Global:** Por impulsar la innovación mediante estándares abiertos e interoperables.

---

**¿Listo para escalar?** Explora nuestro framework de trabajo en [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)

© 2010-{{YEAR}} {{AUTHOR_NAME}} - Todos los derechos reservados.
`;

export const CITATION_CFF = `cff-version: 1.2.0
message: "If you use this software in research, products or documentation, please cite it using the metadata from this file."
title: "{{PROJECT_NAME}}"
type: software
version: "1.0.0"
date-released: "{{YEAR}}-01-01"
authors:
  - family-names: "{{AUTHOR_NAME}}"
    given-names: ""
    email: "{{AUTHOR_EMAIL}}"
repository-code: "{{REPO_URL}}"
url: "{{REPO_URL}}"
license: "{{LICENSE}}"
keywords:
  - TypeScript
  - Deno
  - Automation
  - DevSecOps
  - GitHub-Actions
  - Standards
abstract: "{{DESCRIPTION}}"
`;

export const CITATION_MD = `# 📖 Cómo Citar este Proyecto (Citation Guide)

Si utilizas **{{PROJECT_NAME}}** en publicaciones académicas, especificaciones técnicas, benchmarks o proyectos de software corporativo, por favor cita este repositorio utilizando el estándar **CFF (Citation File Format)** nativo de GitHub o los siguientes formatos.

GitHub renderiza automáticamente el botón **"Cite this repository"** en la barra lateral derecha a partir del archivo [CITATION.cff](CITATION.cff).

---

## Formato BibTeX

\`\`\`bibtex
@software{{{REPO_NAME}}_{{YEAR}},
  author = {{{AUTHOR_NAME}}},
  title = {{{PROJECT_NAME}}: {{DESCRIPTION}}},
  year = {{{YEAR}}},
  url = {{{REPO_URL}}},
  license = {{{LICENSE}}}
}
\`\`\`

## Formato APA (7ª edición)

> {{AUTHOR_NAME}}. ({{YEAR}}). *{{PROJECT_NAME}}* (Versión 1.0.0) [Software de computación]. {{REPO_URL}}

## Formato IEEE

> {{AUTHOR_NAME}}, "{{PROJECT_NAME}}," {{YEAR}}. [En línea]. Disponible en: {{REPO_URL}}.
`;

export const LLMS_TXT = `# {{PROJECT_NAME}}
> {{DESCRIPTION}}

Este archivo sigue la especificación estándar **llms.txt** para proveer contexto semántico estructurado a agentes de inteligencia artificial y modelos de lenguaje (LLMs).

## Enlaces Principales de Arquitectura
- [Repositorio Código]({{REPO_URL}}): Código fuente del proyecto y documentación técnica.
- [Convención de Commits]({{REPO_URL}}/blob/{{DEFAULT_BRANCH}}/.github/COMMIT_CONVENTION.md): Estándar estricto de commits basado en Conventional Commits y validación Regex.
- [Guía de Contribución]({{REPO_URL}}/blob/{{DEFAULT_BRANCH}}/.github/CONTRIBUTING.md): Guía paso a paso para desarrollo y flujos de PR.
- [Política de Seguridad]({{REPO_URL}}/blob/{{DEFAULT_BRANCH}}/SECURITY.md): Políticas de reporte y manejo confidencial de vulnerabilidades.
- [Gobernanza y Conducta]({{REPO_URL}}/blob/{{DEFAULT_BRANCH}}/.github/CODE_OF_CONDUCT.md): Reglas de interacción humana y directrices sobre código generado con IA.

## Directrices para Agentes de Código e Inteligencia Artificial
1. **Conventional Commits Requerido:** Todo cambio generado debe acompañar mensajes con formato: \`<tipo>(<scope>): <asunto>\` respetando el límite de 50 caracteres en el encabezado.
2. **Transparencia en Código de IA:** Toda contribución automatizada o asistida por LLMs debe incluir una mención explícita o Co-authored-by.
3. **Mínimo Privilegio en Workflows:** Cualquier pipeline sugerido debe declarar \`permissions: read-all\` a nivel raíz y definir únicamente los scopes de escritura indispensables.
4. **SemVer Estricto:** Toda rotura de compatibilidad (Breaking Change) debe marcarse con \`BREAKING CHANGE:\` en el footer del commit.
`;

// ---------------------------------------------------------------------------
// 2. .github/ Governance Templates
// ---------------------------------------------------------------------------

export const GITHUB_CODEOWNERS =
  `# ==============================================================================
# PROJECT {{PROJECT_NAME}} - CODEOWNERS CONFIGURATION (GitHub 2026 Standard)
# Purpose: Define ownership, accountability, mandatory review paths & compliance.
# Reference: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
# ==============================================================================

# [ GLOBAL MAINTAINER ]
# Default reviewer for all repository assets to preserve architectural integrity.
* @{{ORG_OR_USER}}

# [ CI/CD & SUPPLY CHAIN SECURITY ]
# Workflows, GitHub configurations, automation and dependency definitions.
.github/ @{{ORG_OR_USER}}
.github/workflows/ @{{ORG_OR_USER}}
.github/dependabot.yml @{{ORG_OR_USER}}

# [ COMPLIANCE, GOVERNANCE & LEGAL ]
# Legal policies, security advisories, licensing and community guides.
LICENSE @{{ORG_OR_USER}}
SECURITY.md @{{ORG_OR_USER}}
.github/SECURITY.md @{{ORG_OR_USER}}
.github/CODE_OF_CONDUCT.md @{{ORG_OR_USER}}
.github/CONTRIBUTING.md @{{ORG_OR_USER}}
CITATION.cff @{{ORG_OR_USER}}
`;

export const GITHUB_CODE_OF_CONDUCT =
  `# ⚖️ Protocolo de Gobernanza y Código de Conducta

## 1. El Estándar DX y Excelencia Humana
\`**{{PROJECT_NAME}}** liderado por {{ORG_OR_USER}}\` no es solo código; es un ecosistema de ingeniería de alto rendimiento. Nuestra misión es escalar soluciones técnicas de vanguardia manteniendo una Developer Experience (DX) excepcional. Este protocolo garantiza que la colaboración sea predecible, rigurosa y respetuosa, donde converjan el mérito técnico y la seguridad psicológica de todos los integrantes.

---

## 2. Pilares de la Ingeniería Sostenible

### 🤝 Colaboración de Alto Impacto
- **Empatía Técnica y Peer Review:** Abordamos las revisiones de código y las discusiones arquitectónicas con rigor técnico pero absoluta cortesía. Priorizamos la calidad del software sobre el ego del autor.
- **Accountability Transparente:** Reconocemos errores de lógica, seguridad o comunicación de forma inmediata, transformándolos en oportunidades de prueba, optimización y documentación.
- **Feedback Basado en Datos:** Todas las propuestas técnicas deben fundamentarse en benchmarks, estándares abiertos y patrones de diseño consolidados, evitando dogmas o sesgos subjetivos.

### 🚫 Cero Tolerancia
- **Hostigamiento y Toxicidad:** Cualquier conducta, lenguaje discriminatorio o comentarios denigrantes acarreará la suspensión inmediata de privilegios.
- **Sabotaje de Discusiones:** El spam, trolling o interrupciones malintencionadas en issues y pull requests degradan la productividad del proyecto y serán moderadas sin previo aviso.
- **Vulneración de la Privacidad (Doxxing):** La revelación de datos personales, credenciales o información privada conllevará la expulsión definitiva del ecosistema.

---

## 3. Directrices sobre IA y Code Integrity (GitHub 2026)
- **Transparencia en Aportes de IA:** Las contribuciones sustanciales generadas o asistidas mediante Modelos de Lenguaje (LLMs) o agentes autónomos deben declararse explícitamente en el cuerpo del Pull Request.
- **Compliance y Propiedad Intelectual:** Es responsabilidad estricta del colaborador validar que el código asistido por IA no reproduzca código protegido por licencias incompatibles o que viole derechos de autor de terceros.

---

## 4. Protocolo de Respuesta a Incidentes (IRP)
Ante cualquier desviación de estos estándares éticos o técnicos, activa de inmediato nuestro canal oficial de integridad:
- 📩 **Canal de Integridad:** [{{AUTHOR_EMAIL}}](mailto:{{AUTHOR_EMAIL}})
- **SLA de Respuesta:** El equipo de mantenimiento acusará recibo y procesará el reporte en un plazo máximo de **48 a 72 horas laborales**, bajo estricta confidencialidad.

---

### Atribución y Marco de Referencia
Este documento adapta el [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct.html) con marcos de gobernanza de **Mozilla** y estándares de seguridad de **OpenSSF**.

© 2010-{{YEAR}} {{AUTHOR_NAME}} - Todos los derechos reservados.
`;

export const GITHUB_COMMIT_CONVENTION =
  `# 📐 Arquitectura de Mensajes de Commit (Conventional Commits)

Para escalar el desarrollo y garantizar una **Software Supply Chain** transparente y auditable, este repositorio implementa una convención estricta basada en el estándar [Conventional Commits v1.0.0](https://www.conventionalcommits.org/). Esta práctica impulsa de forma determinista la generación automatizada de changelogs, el cálculo de **Semantic Versioning (SemVer)** y la trazabilidad de auditorías DevSecOps.

---

## 🔍 Especificación Técnica y Expresión Regular de Validación

Todo aporte y commit debe superar el esquema de validación definido por la siguiente expresión regular antes de integrarse en la rama \`{{DEFAULT_BRANCH}}\`:

\`\`\`js
/^(revert: )?(feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types)(\\([\\w.-]+\\))?: .{1,50}$/
\`\`\`

### Parámetros de Calidad:
- **Scope (Opcional):** Contexto modular del cambio entre paréntesis (ej. \`core\`, \`cli\`, \`api\`, \`deps\`).
- **Encabezado (Subject):** Máximo 50 caracteres, modo imperativo, sin punto final.
- **DX-First:** Un historial de commits limpio facilita el análisis con \`git bisect\` y la ejecución de \`cherry-pick\`.

---

## 🏗️ Estructura del Mensaje

\`\`\`text
<tipo>(<scope>): <asunto breve>

<cuerpo detallado explicando la motivación técnica y el impacto>

<footer>
\`\`\`

### Catálogo de Tipos y Comportamiento en Release:

| Tipo | Impacto DX / Descripción | ¿Aparece en Changelog? |
| :--- | :--- | :---: |
| \`feat\` | Nueva funcionalidad expuesta al usuario. | **Sí (Minor)** |
| \`fix\` | Resolución de un bug o regresión. | **Sí (Patch)** |
| \`perf\` | Optimización de rendimiento o consumo de memoria. | **Sí** |
| \`refactor\` | Reestructuración de código sin alterar comportamiento. | No |
| \`docs\` | Actualización de documentación técnica o diagramas. | No |
| \`test\` | Añadido o corrección de pruebas automatizadas. | No |
| \`ci\` / \`workflow\` | Modificaciones en pipelines de CI/CD de GitHub Actions. | No |
| \`chore\` | Mantenimiento de herramientas, scripts o metadatos. | No |
| \`types\` | Refinamiento de interfaces y definiciones TypeScript. | No |
| \`polish\` | Ajustes cosméticos o mejoras menores de UX. | No |

> 💥 **Breaking Changes:** Cualquier commit que incluya \`BREAKING CHANGE:\` al inicio del footer forzará automáticamente una subida de versión mayor (**Major Release**), sin importar el tipo.

---

## 🔐 Firma Criptográfica de Commits (Verified Badge)

Conforme a las directrices de seguridad de la cadena de suministro de GitHub, se recomienda firmar digitalmente cada commit utilizando llaves **SSH** o **GPG** para garantizar la autenticidad e integridad del autor.

© 2010-{{YEAR}} {{AUTHOR_NAME}} - Todos los derechos reservados.
`;

export const GITHUB_CONTRIBUTING = `# 🚀 Guía y Estándares de Contribución

Gracias por sumarte a la misión de impulsar y escalar **{{PROJECT_NAME}}**. Valoramos la excelencia técnica, el rigor arquitectónico y el compromiso con la calidad. Esta guía establece el marco de trabajo para optimizar la **Developer Experience (DX)** y garantizar la estabilidad del software.

---

## 📌 Gestión Estratégica de Incidencias

### Reportes de Errores (Fidelidad Técnica)
Para optimizar el triaje y la resolución, exigimos reportes con máxima fidelidad técnica:
- **Executive Summary:** Breve descripción del impacto y alcance de la incidencia.
- **Protocolo de Reproducción:** Secuencia determinística de pasos mínimos.
- **Análisis de Desviación:** Contraste claro entre el comportamiento observado vs. el esperado.
- **Stack Tecnológico:** Versión exacta del Runtime (Deno/Node), Sistema Operativo y commit hash.
- **Evidencia Técnica:** Logs de terminal, trazas de error completas o reproducciones mínimas aisladas.

### Propuestas de Nuevas Funcionalidades
Si deseas proponer un cambio estructural, te invitamos a abrir primero un ticket de discusión o issue con un breve *Design Doc*:
- **Valor Agregado:** Justificación de la necesidad y retorno técnico.
- **Casos de Uso:** Escenarios concretos donde la mejora es requerida.
- **Compatibilidad:** Consideraciones sobre retrocompatibilidad y posibles *breaking changes*.

---

## 🛠️ Pipeline de Integración (Pull Requests)

Seguimos un flujo de trabajo riguroso para mantener verde la rama principal (\`{{DEFAULT_BRANCH}}\`):

1. **Crear Rama Temática (Semantic Branching):**
   \`\`\`bash
   git checkout -b feat/nueva-funcionalidad
   # o fix/descripcion-del-bug
   \`\`\`

2. **Garantía de Calidad Local:**
   Antes de abrir el PR, verifica que todos los checks pasen sin advertencias:
   \`\`\`bash
   # En entornos Deno:
   deno fmt --check
   deno lint
   deno test -A
   \`\`\`

3. **Commits Convencionales:**
   Sigue estrictamente la especificación en [.github/COMMIT_CONVENTION.md](COMMIT_CONVENTION.md):
   \`\`\`bash
   git commit -m "feat(core): implement deterministic schema validation"
   \`\`\`

4. **Sincronización:**
   Envía tus cambios a tu fork y abre el PR contra la rama \`{{DEFAULT_BRANCH}}\`.

---

## 📐 Principios de Ingeniería y DX
- **Clean Code & SOLID:** Modularidad atómica, funciones puras y tipado estricto sin uso injustificado de \`any\`.
- **Atomicidad en PRs:** Un PR debe resolver una única responsabilidad.
- **Actualización de Documentación:** Todo cambio en la API pública debe reflejarse en los ejemplos y en el README.

---

© 2010-{{YEAR}} {{AUTHOR_NAME}} - Todos los derechos reservados.
`;

export const GITHUB_FUNDING =
  `# ==============================================================================
# FUNDING.yml - GitHub Sponsors & Financial Sustainability
# Reference: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button
# ==============================================================================

# GitHub Sponsors username
github: {{SPONSOR_USER}}

# Custom sponsorship URLs
custom:
  - {{SPONSOR_URL}}
`;

export const GITHUB_PULL_REQUEST_TEMPLATE =
  `## 📋 Resumen del Cambio (Executive Summary)
<!-- Describe brevemente la motivación técnica y el impacto de este Pull Request -->

Closes #<!-- Número de issue que resuelve, e.g. Closes #42 -->

---

## 🏷️ Tipo de Modificación
- [ ] 🐛 **Fix:** Corrección de error o regresión.
- [ ] ✨ **Feat:** Nueva funcionalidad o capacidad.
- [ ] ⚡ **Perf:** Optimización de rendimiento o consumo de recursos.
- [ ] ♻️ **Refactor:** Reestructuración de código sin alterar comportamiento.
- [ ] 📚 **Docs:** Actualización de documentación o diagramas.
- [ ] 🧪 **Test:** Nuevas pruebas unitarias o de integración.
- [ ] 🔧 **CI/Chore:** Ajustes de pipelines, dependencias o tooling.

---

## 🔍 Checklist de Calidad y DevSecOps
- [ ] He seguido la convención de [Conventional Commits](.github/COMMIT_CONVENTION.md).
- [ ] Mi código cumple con las guías de estilo (\`fmt\` y \`lint\`).
- [ ] He añadido o actualizado pruebas automatizadas para validar los cambios.
- [ ] He verificado que todas las pruebas existentes continúan pasando exitosamente.
- [ ] He documentado adecuadamente las nuevas interfaces o variables introducidas.
- [ ] **Breaking Changes:** Si introduce un cambio incompatible, he marcado \`BREAKING CHANGE:\` en el commit y he explicado el plan de migración abajo.
- [ ] **Transparencia en IA:** Si el código fue asistido por LLMs, he validado su autoría, corrección y cumplimiento de licencias.

---

## 💥 Breaking Changes & Notas de Despliegue
<!-- Si aplica, detalla los pasos de migración requeridos. De lo contrario, indica "N/A" -->
`;

export const GITHUB_SUPPORT = `## 🤝 Soporte, Mantenimiento y Ecosistema

Para garantizar la escalabilidad de **{{PROJECT_NAME}}** y una **Developer Experience (DX)** de primer nivel, hemos establecido protocolos de asistencia diseñados para optimizar el triaje y la resolución de consultas técnicas.

---

### 💬 Centro de Conocimiento y Discusión Comunitaria
Utiliza este espacio para consultas de arquitectura, preguntas frecuentes y retroalimentación sobre la visión del proyecto:
- **[GitHub Discussions]({{REPO_URL}}/discussions):** Ideal para debates técnicos, ideas conceptuales y soporte de la comunidad.

### 🐛 Triaje de Incidencias y Sugerencias Formales
Nuestro sistema de issue tracking sigue especificaciones de alta fidelidad:
- **[Abrir un Ticket en GitHub Issues]({{REPO_URL}}/issues):** Reportes reproducibles de errores y solicitudes de nuevas capacidades.
- **Nota:** Agradecemos incluir logs de terminal, versiones del entorno y reproducciones mínimas.

### 🛡️ Protocolo de Seguridad y Divulgación Privada
La seguridad de nuestro código es una prioridad absoluta. Ante el hallazgo de vulnerabilidades críticas:
1. Revisa nuestra **[Política de Seguridad]({{REPO_URL}}/security/policy)**.
2. Abre un reporte privado en **[Security Advisories]({{REPO_URL}}/security/advisories)** o contacta a: [{{AUTHOR_EMAIL}}](mailto:{{AUTHOR_EMAIL}}).

---

© 2010-{{YEAR}} {{AUTHOR_NAME}} - Todos los derechos reservados.
`;

export const GITHUB_DEPENDABOT =
  `# ==============================================================================
# Dependabot Configuration (GitHub 2026 Specification)
# Groups updates to prevent PR spam and keeps actions & dependencies up to date.
# ==============================================================================
version: 2
updates:
  # Maintain GitHub Actions dependencies
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
      timezone: "UTC"
    open-pull-requests-limit: 10
    rebase-strategy: "auto"
    commit-message:
      prefix: "ci"
      prefix-development: "ci"
      include: "scope"
    groups:
      github-actions:
        patterns:
          - "*"
`;

// ---------------------------------------------------------------------------
// 3. .github/ISSUE_TEMPLATE Form Templates (GitHub 2026 YAML forms)
// ---------------------------------------------------------------------------

export const ISSUE_CONFIG_YML = `blank_issues_enabled: false
contact_links:
  - name: 💬 Preguntas y Discusiones de Arquitectura
    url: {{REPO_URL}}/discussions
    about: Realiza consultas de uso, debate sobre el roadmap o comparte tus proyectos construidos con {{PROJECT_NAME}}.
  - name: 🛡️ Divulgación Privada de Seguridad
    url: {{REPO_URL}}/security/advisories
    about: Reporta vulnerabilidades de forma privada y confidencial a los mantenedores.
`;

export const ISSUE_BUG_REPORT_YML = `name: 🐛 Reporte de Error (Bug Report)
description: Notifica un comportamiento inesperado, error en tiempo de ejecución o regresión.
title: "fix: "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Gracias por tomarte el tiempo para reportar esta anomalía en **{{PROJECT_NAME}}**.
        Por favor completa los siguientes campos con la mayor precisión técnica posible.
  - type: textarea
    id: summary
    attributes:
      label: Descripción Breve del Error
      description: Explica qué ocurrió de forma concisa.
      placeholder: Se produce un fallo de validación al ejecutar...
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Pasos Deterministas de Reproducción
      description: Secuencia exacta para reproducir el fallo.
      placeholder: |
        1. Ejecutar el comando '...'
        2. Proporcionar la entrada '...'
        3. Observar el error en la terminal
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Comportamiento Esperado vs. Observado
      description: ¿Qué debió haber ocurrido y qué ocurrió en su lugar?
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Trazas de Error y Logs de Consola
      description: Pega aquí la salida de la terminal o stack traces.
      render: shell
  - type: input
    id: environment
    attributes:
      label: Entorno de Ejecución
      description: Sistema Operativo, Runtime y versión exacta (ej. Windows 11, Deno v2.9.7, Node v24).
      placeholder: e.g. Ubuntu 24.04 LTS / Deno 2.9.7
    validations:
      required: true
`;

export const ISSUE_FEATURE_REQUEST_YML =
  `name: ✨ Propuesta de Nueva Funcionalidad (Feature Request)
description: Sugiere una mejora técnica, nueva integración o optimización arquitectónica.
title: "feat: "
labels: ["enhancement", "proposal"]
body:
  - type: markdown
    attributes:
      value: |
        Apreciamos tus aportes para evolucionar **{{PROJECT_NAME}}**.
  - type: textarea
    id: problem
    attributes:
      label: Problema o Caso de Uso
      description: ¿Qué problema o limitación estás intentando resolver?
      placeholder: Actualmente no es posible generar...
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Solución Propuesta (Design Doc Breve)
      description: Describe cómo visualizas la implementación o la API resultante.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternativas Consideradas
      description: ¿Qué otras soluciones exploraste y por qué fueron descartadas?
`;

// ---------------------------------------------------------------------------
// 4. .github/workflows Templates (GitHub 2026 Enterprise Workflows)
// ---------------------------------------------------------------------------

export const WORKFLOW_CI_YML = `name: CI Suite

on:
  push:
    branches: [{{DEFAULT_BRANCH}}, master, main]
  pull_request:
    branches: [{{DEFAULT_BRANCH}}, master, main]

# 2026 Security Principle: Least Privilege Permissions
permissions: read-all

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Code Quality & Testing
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Setup Deno Environment
        uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Format & Lint Verification
        run: |
          deno fmt --check
          deno lint

      - name: Run Test Suite
        run: |
          deno test -A
`;

export const WORKFLOW_SECURITY_AUDIT_YML = `name: DevSecOps & Security Audit

on:
  push:
    branches: [{{DEFAULT_BRANCH}}, master, main]
  pull_request:
    branches: [{{DEFAULT_BRANCH}}, master, main]
  schedule:
    - cron: '0 2 * * 1'

permissions:
  contents: read
  security-events: write

concurrency:
  group: security-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  nemesis:
    name: Nemesis DevSecOps & Secret Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Run Nemesis DevSecOps Auditor
        uses: glastor-dev/nemesis@master
        continue-on-error: true
        with:
          diff-mode: \${{ github.event_name == 'pull_request' }}
          auto-fix: false
          scan-secrets: true
          scan-sast: true
          scan-sca: true
          scan-hygiene: true
          scan-licenses: true
          generate-sbom: true
          upload-sarif: true
          fail-on-critical: false
`;

export const WORKFLOW_CODEQL_YML = `name: CodeQL SAST Analysis

on:
  push:
    branches: [{{DEFAULT_BRANCH}}, master, main]
  pull_request:
    branches: [{{DEFAULT_BRANCH}}, master, main]
  schedule:
    - cron: '0 3 * * 1'

permissions:
  actions: read
  contents: read
  security-events: write

concurrency:
  group: codeql-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  analyze:
    name: Static Application Security Testing (SAST)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:javascript-typescript"
`;

export const WORKFLOW_SCORECARD_YML = `name: OpenSSF Scorecard

on:
  branch_protection_rule:
  schedule:
    - cron: '30 1 * * 6'
  push:
    branches: [{{DEFAULT_BRANCH}}, master, main]

permissions: read-all

jobs:
  analysis:
    name: Scorecard Supply-Chain Security Analysis
    runs-on: ubuntu-latest
    continue-on-error: true
    permissions:
      security-events: write
      id-token: write
      contents: read
      actions: read

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Run OpenSSF Scorecard
        uses: ossf/scorecard-action@v2.4.0
        with:
          results_file: results.sarif
          results_format: sarif
          publish_results: true

      - name: Upload SARIF Results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
`;

export const WORKFLOW_DEPENDABOT_AUTOMERGE_YML = `name: Dependabot Auto-Merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    name: Auto-merge Minor & Patch Dependencies
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Dependabot Metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: "\${{ secrets.GITHUB_TOKEN }}"

      - name: Enable Auto-Merge for Non-Major Updates
        if: steps.metadata.outputs.update-type != 'version-update:semver-major'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: \${{ github.event.pull_request.html_url }}
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

// ---------------------------------------------------------------------------
// 5. Organization .github Profile Showcase Template (GitHub 2026 Standard)
// ---------------------------------------------------------------------------

export const ORG_PROFILE_README =
  `# 🏛️ {{ORG_OR_USER}} | Ecosistema de Ingeniería & Gobernanza

<p align="center">
  <a href="https://github.com/{{ORG_OR_USER}}"><img src="https://img.shields.io/badge/GitHub%202026-Enforced%20Standards-blue.svg?style=for-the-badge&logo=github" alt="GitHub 2026 Ready"/></a>
  <a href="https://bestpractices.coreinfrastructure.org"><img src="https://img.shields.io/badge/OpenSSF-Scorecard%20Gold-success.svg?style=for-the-badge&logo=shield" alt="OpenSSF Scorecard"/></a>
  <a href="https://github.com/sponsors/{{SPONSOR_USER}}"><img src="https://img.shields.io/badge/Sponsor-{{SPONSOR_USER}}-ea4aaa.svg?style=for-the-badge&logo=githubsponsors" alt="Sponsor"/></a>
  <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="Apache 2.0"/></a>
</p>

---

## ⚡ Manifiesto Tecnológico y Misión de Ingeniería

\`{{ORG_OR_USER}}\` es un ecosistema de software de alto rendimiento dedicado a la construcción de herramientas de infraestructura, desarrollo (**DX-First**) y arquitecturas DevSecOps resilientes basadas en estándares abiertos.

Nuestros repositorios se rigen por tres principios innegociables:
1. **DevSecOps desde el Día Cero:** Escaneo continuo de credenciales y secretos (TruffleHog), análisis estático SAST (CodeQL) y auditoría automatizada de dependencias (Dependabot).
2. **Determinismo y Rigor Arquitectónico:** Convenciones estrictas de commit (Conventional Commits 1.0), firmas criptográficas de commits (Verified Badge) y TypeScript estricto.
3. **Gobernanza Centralizada:** Políticas de salud comunitaria unificadas, respuesta privada ante vulnerabilidades (PVR) y acuerdos de nivel de servicio (SLAs) transparentes.

---

## 📐 Mapa de Arquitectura del Ecosistema

\`\`\`mermaid
flowchart TB
    subgraph Governance["🏛️ Gobernanza Global (.github)"]
        CoC["Código de Conducta<br/>(Contributor Covenant 2.1 + AI)"]
        Sec["Seguridad Global<br/>(PVR & CVSS SLAs)"]
        Contrib["Guía de Contribución<br/>(Conventional Commits)"]
        Support["Soporte Comunitario<br/>(Discussions & SLAs)"]
    end

    subgraph Repositories["📦 Repositorios del Ecosistema"]
        Kernel["Kernel & Runtimes<br/>(Deno / Rust / TypeScript)"]
        Tooling["CLI & DX Tools<br/>(Generadores & AST Automators)"]
        Edge["Edge Platforms<br/>(Microservicios & Cloud)"]
    end

    subgraph Pipelines["🛡️ Pipelines DevSecOps Locales"]
        CI["CI Multi-Runtime<br/>(Least Privilege: read-all)"]
        SAST["CodeQL & TruffleHog<br/>(Secret Scanning)"]
        Scorecard["OpenSSF Scorecard<br/>(SLSA Provenance)"]
    end

    Governance --> Repositories
    Repositories --> Pipelines
\`\`\`

---

## 🏛️ Catálogo de Gobernanza Global Heredada

Este repositorio (\`{{ORG_OR_USER}}/.github\`) define la política de gobernanza y salud comunitaria para **todos** los repositorios de la organización:

- 🛡️ **[Política de Seguridad (SECURITY.md)](SECURITY.md):** Procedimiento formal para la divulgación privada y coordinada de vulnerabilidades con SLA de 24-48h.
- ⚖️ **[Código de Conducta (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md):** Parámetros de excelencia profesional, respeto y directrices de transparencia en código asistido por Inteligencia Artificial.
- 🚀 **[Guía de Contribución (CONTRIBUTING.md)](CONTRIBUTING.md):** Flujo de trabajo para apertura de Pull Requests, pruebas automatizadas y estándares de código limpio.
- 💬 **[Protocolo de Soporte (SUPPORT.md)](SUPPORT.md):** Triaje de incidencias, GitHub Discussions y canales corporativos.
- 💡 **[Patrocinio y Sostenibilidad (.github/FUNDING.yml)](.github/FUNDING.yml):** Inversión estratégica en el desarrollo continuo del ecosistema.

---

## 👥 Dirección y Liderazgo de Ingeniería

- **{{AUTHOR_NAME}}** ([@{{ORG_OR_USER}}](https://github.com/{{ORG_OR_USER}}))
  - *Lead Software Architect & Maintainer*
  - Contacto: [{{AUTHOR_EMAIL}}](mailto:{{AUTHOR_EMAIL}})

© 2010-{{YEAR}} {{AUTHOR_NAME}} - Todos los derechos reservados.
`;

/**
 * Returns all generated files for a given context
 */
export function getAllTemplates(ctx: TemplateContext): GeneratedFile[] {
  return [
    // 1. Root files
    {
      relativePath: "SECURITY.md",
      content: renderTemplate(ROOT_SECURITY_MD, ctx),
      category: "root",
      description:
        "Root Security Policy with private vulnerability reporting SLA & CVSS standards",
    },
    {
      relativePath: "CONTRIBUTORS.md",
      content: renderTemplate(CONTRIBUTORS_MD, ctx),
      category: "root",
      description:
        "Leadership, governance, DX-first framework & financial sustainability roadmap",
    },
    {
      relativePath: "CITATION.cff",
      content: renderTemplate(CITATION_CFF, ctx),
      category: "root",
      description:
        "Citation File Format v1.2.0 (triggers GitHub 'Cite this repository' UI)",
    },
    {
      relativePath: "CITATION.md",
      content: renderTemplate(CITATION_MD, ctx),
      category: "root",
      description: "BibTeX, APA, IEEE human-readable citation guide",
    },
    {
      relativePath: "llms.txt",
      content: renderTemplate(LLMS_TXT, ctx),
      category: "root",
      description: "2026 Standard for AI agents and LLM architectural indexing",
    },

    // 2. .github Governance files
    {
      relativePath: ".github/CODEOWNERS",
      content: renderTemplate(GITHUB_CODEOWNERS, ctx),
      category: "governance",
      description:
        "Granular review ownership by module (core, workflows, legal, security)",
    },
    {
      relativePath: ".github/CODE_OF_CONDUCT.md",
      content: renderTemplate(GITHUB_CODE_OF_CONDUCT, ctx),
      category: "governance",
      description:
        "Contributor Covenant v2.1 with AI code integrity & transparency clauses",
    },
    {
      relativePath: ".github/COMMIT_CONVENTION.md",
      content: renderTemplate(GITHUB_COMMIT_CONVENTION, ctx),
      category: "governance",
      description:
        "Conventional Commits 1.0 specification with SemVer rules and regex validation",
    },
    {
      relativePath: ".github/CONTRIBUTING.md",
      content: renderTemplate(GITHUB_CONTRIBUTING, ctx),
      category: "governance",
      description:
        "DX-first contribution workflow, clean code standards and PR checklist",
    },
    {
      relativePath: ".github/FUNDING.yml",
      content: renderTemplate(GITHUB_FUNDING, ctx),
      category: "governance",
      description: "GitHub Sponsors & community financial channels",
    },
    {
      relativePath: ".github/PULL_REQUEST_TEMPLATE.md",
      content: renderTemplate(GITHUB_PULL_REQUEST_TEMPLATE, ctx),
      category: "governance",
      description:
        "Structured PR submission form with DevSecOps checklist & breaking changes",
    },
    {
      relativePath: ".github/SECURITY.md",
      content: renderTemplate(ROOT_SECURITY_MD, ctx),
      category: "governance",
      description: "Governance security mirror for .github discovery",
    },
    {
      relativePath: ".github/SUPPORT.md",
      content: renderTemplate(GITHUB_SUPPORT, ctx),
      category: "governance",
      description: "Community support guidelines, Discussions triage and SLAs",
    },
    {
      relativePath: ".github/dependabot.yml",
      content: renderTemplate(GITHUB_DEPENDABOT, ctx),
      category: "governance",
      description: "Dependabot v2 configuration with grouped weekly updates",
    },

    // 3. Issue templates
    {
      relativePath: ".github/ISSUE_TEMPLATE/config.yml",
      content: renderTemplate(ISSUE_CONFIG_YML, ctx),
      category: "issues",
      description: "Issue template configuration with contact links",
    },
    {
      relativePath: ".github/ISSUE_TEMPLATE/bug_report.yml",
      content: renderTemplate(ISSUE_BUG_REPORT_YML, ctx),
      category: "issues",
      description: "YAML Issue Form for high-fidelity bug reporting",
    },
    {
      relativePath: ".github/ISSUE_TEMPLATE/feature_request.yml",
      content: renderTemplate(ISSUE_FEATURE_REQUEST_YML, ctx),
      category: "issues",
      description: "YAML Issue Form for architectural feature requests",
    },

    // 4. Workflows
    {
      relativePath: ".github/workflows/ci.yml",
      content: renderTemplate(WORKFLOW_CI_YML, ctx),
      category: "workflows",
      description:
        "CI pipeline with concurrency and least privilege permissions",
    },
    {
      relativePath: ".github/workflows/security-audit.yml",
      content: renderTemplate(WORKFLOW_SECURITY_AUDIT_YML, ctx),
      category: "workflows",
      description: "Secret scanning with TruffleHog OSS DevSecOps",
    },
    {
      relativePath: ".github/workflows/codeql.yml",
      content: renderTemplate(WORKFLOW_CODEQL_YML, ctx),
      category: "workflows",
      description: "GitHub CodeQL Static Application Security Testing (SAST)",
    },
    {
      relativePath: ".github/workflows/scorecard.yml",
      content: renderTemplate(WORKFLOW_SCORECARD_YML, ctx),
      category: "workflows",
      description: "OpenSSF Supply-Chain Security Scorecard automation",
    },
    {
      relativePath: ".github/workflows/dependabot-automerge.yml",
      content: renderTemplate(WORKFLOW_DEPENDABOT_AUTOMERGE_YML, ctx),
      category: "workflows",
      description: "Automated safe merging for minor/patch Dependabot PRs",
    },
  ];
}

/**
 * Returns only repository-specific files that CANNOT be inherited from .github org repo
 * (Workflows, Dependabot, CODEOWNERS, CITATION, llms.txt, CONTRIBUTORS)
 */
export function getHybridTemplates(ctx: TemplateContext): GeneratedFile[] {
  const all = getAllTemplates(ctx);
  const hybridRelativePaths = new Set([
    "CITATION.cff",
    "CITATION.md",
    "CONTRIBUTORS.md",
    "llms.txt",
    ".github/CODEOWNERS",
    ".github/dependabot.yml",
    ".github/workflows/ci.yml",
    ".github/workflows/security-audit.yml",
    ".github/workflows/codeql.yml",
    ".github/workflows/scorecard.yml",
    ".github/workflows/dependabot-automerge.yml",
  ]);

  return all.filter((t) => hybridRelativePaths.has(t.relativePath));
}

/**
 * Returns the files needed to populate the organization's special .github repository
 * (Profile Showcase README, Global Code of Conduct, Contributing, Security, Support, Issue Templates, Funding)
 */
export function getOrgTemplates(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      relativePath: ".github/profile/README.md",
      content: renderTemplate(ORG_PROFILE_README, ctx),
      category: "governance",
      description:
        "Organization Profile Showcase with Mermaid Architecture & Status Badges",
    },
    {
      relativePath: "CODE_OF_CONDUCT.md",
      content: renderTemplate(GITHUB_CODE_OF_CONDUCT, ctx),
      category: "governance",
      description:
        "Organization-wide Code of Conduct with AI code integrity clause",
    },
    {
      relativePath: "CONTRIBUTING.md",
      content: renderTemplate(GITHUB_CONTRIBUTING, ctx),
      category: "governance",
      description: "Organization-wide Contribution Guidelines",
    },
    {
      relativePath: "SECURITY.md",
      content: renderTemplate(ROOT_SECURITY_MD, ctx),
      category: "governance",
      description:
        "Organization-wide Security Policy with Private Vulnerability Reporting (PVR)",
    },
    {
      relativePath: "SUPPORT.md",
      content: renderTemplate(GITHUB_SUPPORT, ctx),
      category: "governance",
      description: "Organization-wide Support and Discussions Protocol",
    },
    {
      relativePath: ".github/FUNDING.yml",
      content: renderTemplate(GITHUB_FUNDING, ctx),
      category: "governance",
      description: "Organization-wide GitHub Sponsors configuration",
    },
    {
      relativePath: ".github/PULL_REQUEST_TEMPLATE.md",
      content: renderTemplate(GITHUB_PULL_REQUEST_TEMPLATE, ctx),
      category: "governance",
      description: "Organization-wide Pull Request Template",
    },
    {
      relativePath: ".github/ISSUE_TEMPLATE/config.yml",
      content: renderTemplate(ISSUE_CONFIG_YML, ctx),
      category: "issues",
      description: "Issue template configuration with contact links",
    },
    {
      relativePath: ".github/ISSUE_TEMPLATE/bug_report.yml",
      content: renderTemplate(ISSUE_BUG_REPORT_YML, ctx),
      category: "issues",
      description: "YAML Issue Form for high-fidelity bug reporting",
    },
    {
      relativePath: ".github/ISSUE_TEMPLATE/feature_request.yml",
      content: renderTemplate(ISSUE_FEATURE_REQUEST_YML, ctx),
      category: "issues",
      description: "YAML Issue Form for architectural feature requests",
    },
  ];
}
