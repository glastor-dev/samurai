#!/usr/bin/env -S deno run -A

import { parseArgs } from "@std/cli/parse-args";
import * as colors from "@std/fmt/colors";
import {
  generateStandards,
  type GenerationMode,
  resolveContext,
} from "./generator.ts";
import {
  getAllTemplates,
  getHybridTemplates,
  getOrgTemplates,
} from "./templates.ts";
import { printDoctorReport, runDoctor } from "./doctor.ts";
import { runWizard } from "./wizard.ts";
import { printUpdateReport, updateStandards } from "./updater.ts";
import type { TechStack } from "./detector.ts";

const HELP = `
${
  colors.bold(
    colors.cyan(
      "⚔️  SAMURAI / GLASTOR STANDARDS GENERATOR (GitHub 2026 Ready)",
    ),
  )
}
${
  colors.gray(
    "Genera en un segundo toda la documentación y flujos exigidos por GitHub en 2026.",
  )
}

${colors.bold("USO:")}
  deno run -A jsr:@glastor-dev/samurai [COMANDO] [OPCIONES]
  deno run -A src/cli.ts [COMANDO] [OPCIONES]

${colors.bold("COMANDOS PRINCIPALES:")}
  ${colors.green("hybrid")}             🌟 ${
  colors.bold("ENFOQUE HÍBRIDO (Recomendado):")
} Genera la infraestructura local
                         obligatoria (Workflows, Dependabot agrupado, CODEOWNERS,
                         CITATION.cff, llms.txt, CONTRIBUTORS.md, lefthook.yml),
                         heredando la gobernanza social de la organización .github.
  ${
  colors.green("org-init")
}           🏛️  Genera el paquete para el repositorio especial ${
  colors.bold(".github")
}
                         con portada interactiva Mermaid, Código de Conducta global,
                         políticas de seguridad, soporte, formularios YAML y patrocinio.
  ${colors.green("doctor")} / ${
  colors.green("check")
}      🩺 Audita el repositorio actual contra las exigencias GitHub 2026
                         y emite un diagnóstico con calificación del 0 al 100%.
  ${
  colors.green("wizard")
}             🧙 Asistente interactivo guiado en terminal para configuración rápida.
  ${colors.green("update")} / ${
  colors.green("sync")
}      🔄 Sincroniza y actualiza los archivos existentes a los estándares 2026
                         preservando marcas (Glastor®) y resolviendo rutas duales.
  ${
  colors.green("init")
}               📦 MODO STANDALONE: Genera el catálogo completo autónomo.
  ${
  colors.green("list")
}               📋 Muestra la lista de todos los archivos generables.
  ${colors.green("diff")} / ${
  colors.green("preview")
}     🔎 Simula la creación (dry-run) sin escribir en disco.

${colors.bold("OPCIONES:")}
  ${
  colors.yellow("-m, --mode")
} <type>      Modo de generación: 'hybrid', 'org' o 'standalone' (default)
  ${
  colors.yellow("--lang")
} <en|es>         Idioma de la documentación: 'en' (English/Global) o 'es' (Español)
  ${
  colors.yellow("--stack")
} <type>        Ecosistema: 'auto' (detectar), 'deno', 'rust', 'node', 'python', 'go'
  ${
  colors.yellow("--no-hooks")
}           Omite la creación de git hooks con Lefthook (commit-msg y pre-commit)
  ${colors.yellow("-f, --force")}          Sobrescribe archivos si ya existen
  ${colors.yellow("-d, --dir")} <path>     Directorio destino (por defecto: ./)
  ${
  colors.yellow("--diff")
}                Muestra diferencias línea por línea de los archivos a actualizar
  ${
  colors.yellow("--backup")
}              Crea un respaldo .bak antes de sobrescribir archivos existentes
  ${
  colors.yellow("--all")
}                 Además de actualizar existentes, genera archivos faltantes
  ${
  colors.yellow("--files")
} <f1,f2>      Filtra qué archivos específicos actualizar (ej: SECURITY.md,CODEOWNERS)
  ${
  colors.yellow("--dry-run")
}            Modo simulación sin escribir en el sistema de archivos
  ${
  colors.yellow("--org")
} <name>         Organización o usuario de GitHub (auto-detectado por git)
  ${
  colors.yellow("--repo")
} <name>        Nombre del repositorio (auto-detectado por directorio o git)
  ${
  colors.yellow("--author")
} <name>      Nombre del autor o mantenedor principal
  ${
  colors.yellow("--email")
} <email>      Correo electrónico oficial para alertas de seguridad
  ${colors.yellow("--branch")} <branch>    Rama principal (main / master)
  ${
  colors.yellow("--license")
} <spdx>     Identificador SPDX de la licencia (default: Apache-2.0)
  ${
  colors.yellow("--workflows-only")
}     Genera únicamente los workflows en .github/workflows/
  ${
  colors.yellow("--governance-only")
}    Genera únicamente archivos de gobernanza (.github/)
  ${colors.yellow("-h, --help")}           Muestra este mensaje de ayuda
`;

async function main() {
  const flags = parseArgs(Deno.args, {
    boolean: [
      "help",
      "force",
      "dry-run",
      "diff",
      "backup",
      "all",
      "workflows-only",
      "governance-only",
      "root-only",
      "no-hooks",
      "version",
    ],
    string: [
      "dir",
      "mode",
      "lang",
      "stack",
      "files",
      "org",
      "repo",
      "author",
      "email",
      "branch",
      "license",
      "project",
    ],
    alias: {
      h: "help",
      f: "force",
      d: "dir",
      m: "mode",
      l: "lang",
      s: "stack",
      v: "version",
    },
    default: {
      dir: ".",
    },
  });

  if (flags.help || flags._.includes("help")) {
    console.log(HELP);
    Deno.exit(0);
  }

  if (flags.version || flags._.includes("version")) {
    console.log("v1.0.0");
    Deno.exit(0);
  }

  const targetDir = flags.dir || ".";
  const rawCommand = flags._[0] ? String(flags._[0]).toLowerCase() : "";

  // 1. Doctor command
  if (rawCommand === "doctor" || rawCommand === "check") {
    const report = await runDoctor(targetDir);
    printDoctorReport(report);
    Deno.exit(report.percentage >= 80 ? 0 : 1);
  }

  // 2. Wizard command
  if (rawCommand === "wizard" || rawCommand === "interactive") {
    await runWizard(targetDir);
    Deno.exit(0);
  }

  // 3. Update / Sync command
  if (
    rawCommand === "update" || rawCommand === "sync" || rawCommand === "upgrade"
  ) {
    const report = await updateStandards({
      targetDir,
      createMissing: !!(flags["all"] || flags["create-missing"]),
      backup: !!flags["backup"],
      dryRun: !!(flags["dry-run"] || flags["diff"] || flags["preview"]),
      showDiff: !!(flags["diff"] || flags["preview"]),
      lang: (flags.lang === "es" || flags.lang === "en")
        ? flags.lang
        : undefined,
      stack: flags.stack as (TechStack | "auto" | undefined),
      includeHooks: !flags["no-hooks"],
      files: flags["files"] ? String(flags["files"]).split(",") : undefined,
      customContext: {
        ...(flags.org ? { orgOrUser: String(flags.org) } : {}),
        ...(flags.repo ? { repoName: String(flags.repo) } : {}),
        ...(flags.author ? { authorName: String(flags.author) } : {}),
      },
    });

    printUpdateReport(report, {
      showDiff: !!(flags["diff"] || flags["preview"]),
    });
    Deno.exit(0);
  }

  // Resolve generation mode
  let mode: GenerationMode = "standalone";
  if (rawCommand === "hybrid" || flags.mode === "hybrid") {
    mode = "hybrid";
  } else if (
    rawCommand === "org" || rawCommand === "org-init" || flags.mode === "org"
  ) {
    mode = "org";
  } else if (flags.mode === "standalone") {
    mode = "standalone";
  }

  const lang = (flags.lang === "es" || flags.lang === "en") ? flags.lang : "en";
  const stack = flags.stack as (TechStack | "auto" | undefined);
  const includeHooks = !flags["no-hooks"];

  if (rawCommand === "list") {
    const ctx = await resolveContext(targetDir, {}, {
      lang,
      stack,
      includeHooks,
    });
    console.log(
      colors.bold(
        colors.cyan(
          `\n📋 Catálogo de Archivos GitHub 2026 según Enfoque Arquitectónico:\n`,
        ),
      ),
    );

    console.log(
      colors.bold(
        colors.green(
          "🌟 ENFOQUE HÍBRIDO (Archivos Locales Obligatorios por Repositorio):",
        ),
      ),
    );
    for (const item of getHybridTemplates(ctx)) {
      console.log(
        `  ${colors.green("✓")} ${colors.bold(item.relativePath)} - ${
          colors.gray(item.description)
        }`,
      );
    }

    console.log(
      colors.bold(
        colors.magenta(
          "\n🏛️  REPOSITORIO .GITHUB (Gobernanza Global de Organización):",
        ),
      ),
    );
    for (const item of getOrgTemplates(ctx)) {
      console.log(
        `  ${colors.magenta("✓")} ${colors.bold(item.relativePath)} - ${
          colors.gray(item.description)
        }`,
      );
    }

    console.log(
      colors.bold(
        colors.yellow(
          `\n📦 MODO STANDALONE (Total Completo: ${
            getAllTemplates(ctx).length
          } archivos)`,
        ),
      ),
    );
    console.log();
    Deno.exit(0);
  }

  const isDryRun = flags["dry-run"] || rawCommand === "preview" ||
    rawCommand === "diff";

  // Categories filter
  let categories:
    | Array<"root" | "governance" | "issues" | "workflows">
    | undefined;
  if (flags["workflows-only"]) {
    categories = ["workflows"];
  } else if (flags["governance-only"]) {
    categories = ["governance", "issues"];
  } else if (flags["root-only"]) {
    categories = ["root"];
  }

  console.log(
    colors.bold(
      colors.cyan("\n🚀 Inicializando Generador de Estándares GitHub 2026..."),
    ),
  );

  if (mode === "hybrid") {
    console.log(
      colors.bold(
        colors.green(
          "🌟 MODO: Enfoque Híbrido (Infraestructura Local Obligatoria de Repositorio)",
        ),
      ),
    );
    console.log(
      colors.gray(
        "   La gobernanza global se hereda automáticamente del repositorio org/.github.\n",
      ),
    );
  } else if (mode === "org") {
    console.log(
      colors.bold(
        colors.magenta(
          "🏛️  MODO: Repositorio Organizacional .github (Herencia Global)",
        ),
      ),
    );
    console.log(
      colors.gray(
        "   Generando portada interactiva Mermaid y gobernanza para toda la organización.\n",
      ),
    );
  } else {
    console.log(
      colors.bold(
        colors.yellow(
          "📦 MODO: Standalone (Catálogo Completo Autónomo de Archivos)\n",
        ),
      ),
    );
  }

  if (isDryRun) {
    console.log(
      colors.yellow(
        "⚠️  MODO SIMULACIÓN (Dry-run): No se escribirán archivos en disco.\n",
      ),
    );
  }

  const result = await generateStandards({
    targetDir,
    force: flags.force,
    dryRun: isDryRun,
    mode,
    lang,
    stack,
    includeHooks,
    categories,
    customContext: {
      orgOrUser: flags.org,
      repoName: flags.repo,
      authorName: flags.author,
      authorEmail: flags.email,
      defaultBranch: flags.branch,
      license: flags.license,
      projectName: flags.project,
    },
  });

  console.log(colors.bold(colors.white("Configuración detectada / aplicada:")));
  console.log(
    `  • Repositorio:   ${
      colors.green(result.context.orgOrUser + "/" + result.context.repoName)
    }`,
  );
  console.log(
    `  • Autor / Lead:  ${
      colors.green(
        result.context.authorName + " <" + result.context.authorEmail + ">",
      )
    }`,
  );
  console.log(
    `  • Rama Base:     ${colors.green(result.context.defaultBranch)}`,
  );
  console.log(
    `  • Licencia:      ${colors.green(result.context.license)}`,
  );
  console.log(
    `  • Ecosistema:    ${
      colors.cyan(result.context.stackDisplayName || "Universal")
    }`,
  );
  console.log(
    `  • Idioma:        ${
      colors.cyan(result.context.lang === "es" ? "Español" : "English")
    }`,
  );
  console.log(
    `  • Modo Activo:   ${colors.cyan(result.mode.toUpperCase())}`,
  );
  console.log(
    `  • Año:           ${colors.green(result.context.year)}\n`,
  );

  console.log(colors.bold("Archivos Procesados:"));
  for (const file of result.written) {
    console.log(
      `  ${colors.green(isDryRun ? "🔎 [PREVIEW]" : "✅ [CREADO]")} ${file}`,
    );
  }

  if (result.skipped.length > 0) {
    console.log(
      colors.bold(
        colors.yellow(
          "\nArchivos existentes omitidos (usa --force para sobrescribir):",
        ),
      ),
    );
    for (const file of result.skipped) {
      console.log(`  ${colors.yellow("⚠️  [OMITIDO]")} ${file}`);
    }
  }

  console.log(colors.bold(colors.cyan("\n✨ Resumen de Operación:")));
  console.log(`  Modo:              ${result.mode}`);
  console.log(`  Total evaluados:   ${result.total}`);
  console.log(
    `  Generados/Listos:  ${colors.green(String(result.written.length))}`,
  );
  console.log(
    `  Omitidos (exist):  ${colors.yellow(String(result.skipped.length))}`,
  );

  if (result.written.length > 0 && !isDryRun) {
    console.log(
      colors.bold(
        colors.green(
          "\n🎉 ¡Repositorio 100% blindado con estándares GitHub 2026!",
        ),
      ),
    );
    if (mode === "hybrid") {
      console.log(
        colors.gray(
          "   Enfoque Híbrido activo: Workflows, Dependabot agrupado, CODEOWNERS, CITATION.cff y Lefthook.",
        ),
      );
    } else if (mode === "org") {
      console.log(
        colors.gray(
          "   Paquete de Organización listo: Sube este contenido al repositorio .github para activar la herencia global.",
        ),
      );
    }
  }
}

if (import.meta.main) {
  await main();
}
