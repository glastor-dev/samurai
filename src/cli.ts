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
  deno run -A jsr:@glastor-dev/standards [COMANDO] [OPCIONES]
  deno run -A src/cli.ts [COMANDO] [OPCIONES]

${colors.bold("COMANDOS PRINCIPALES (ENFOQUE HÍBRIDO & STANDALONE):")}
  ${colors.green("hybrid")}             🌟 ${
  colors.bold(
    "ENFOQUE HÍBRIDO (Recomendado):",
  )
} Solo genera los archivos locales
                         que GitHub exige por repo (Workflows, Dependabot, CODEOWNERS,
                         CITATION.cff, llms.txt, CONTRIBUTORS.md), heredando el resto
                         desde el repositorio .github de la organización.
  ${
  colors.green("org-init")
}           🏛️  Genera el repositorio institucional especial ${
  colors.bold(
    ".github",
  )
}
                         con la portada interactiva Mermaid, Código de Conducta global,
                         políticas de seguridad, soporte, formularios YAML y patrocinio.
  ${
  colors.green("init")
}               📦 MODO STANDALONE: Genera el catálogo completo (22 archivos)
  ${
  colors.green("list")
}               📋 Muestra la lista de todos los archivos generables
  ${colors.green("diff")} / ${
  colors.green("preview")
}     🔎 Simula la creación (dry-run) sin escribir en disco

${colors.bold("OPCIONES:")}
  ${
  colors.yellow("-m, --mode")
} <type>      Modo de generación: 'hybrid', 'org' o 'standalone' (default)
  ${colors.yellow("-f, --force")}          Sobrescribe archivos si ya existen
  ${colors.yellow("-d, --dir")} <path>     Directorio destino (por defecto: ./)
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
      "workflows-only",
      "governance-only",
      "root-only",
      "version",
    ],
    string: [
      "dir",
      "mode",
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

  if (rawCommand === "list") {
    const ctx = await resolveContext(targetDir);
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
          "📦 MODO: Standalone (Catálogo Completo Autónomo de 22 Archivos)\n",
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
          "   Enfoque Híbrido activo: Workflows, Dependabot agrupado, CODEOWNERS y CITATION.cff locales.",
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
