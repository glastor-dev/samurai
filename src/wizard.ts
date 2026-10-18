import * as colors from "@std/fmt/colors";
import { generateStandards, type GenerationMode } from "./generator.ts";
import { detectStack, type TechStack } from "./detector.ts";

export async function runWizard(targetDir: string = "."): Promise<void> {
  console.log(
    colors.bold(
      colors.cyan(
        "\n🧙 ASISTENTE INTERACTIVO SAMURAI (GitHub 2026 Standards)\n",
      ),
    ),
  );
  console.log(
    colors.gray(
      "Configura en 15 segundos la arquitectura de estándares ideal para tu repositorio.\n",
    ),
  );

  const detectedStack = await detectStack(targetDir);

  const promptUser = (question: string, defaultValue: string): string => {
    const response = prompt(
      `${colors.bold(question)} ${colors.gray(`[${defaultValue}]`)}:`,
    );
    return response ? response.trim() : defaultValue;
  };

  // 1. Mode selection
  console.log(colors.bold("1. ¿Qué enfoque arquitectónico deseas aplicar?"));
  console.log(
    `   ${colors.green("1)")} 🌟 ${
      colors.bold("Enfoque Híbrido")
    } (Recomendado: Solo infraestructura local del repo)`,
  );
  console.log(
    `   ${colors.yellow("2)")} 📦 ${
      colors.bold("Modo Standalone")
    } (Catálogo completo de 22 archivos autónomos)`,
  );
  console.log(
    `   ${colors.magenta("3)")} 🏛️  ${
      colors.bold("Organización .github")
    } (Portada interactiva Mermaid & gobernanza global)`,
  );

  const modeChoice = promptUser("Selecciona una opción (1, 2 o 3)", "1");
  let mode: GenerationMode = "hybrid";
  if (modeChoice === "2") mode = "standalone";
  else if (modeChoice === "3") mode = "org";

  // 2. Language selection
  console.log(
    colors.bold("\n2. ¿En qué idioma deseas generar la documentación?"),
  );
  console.log(
    `   ${
      colors.cyan("1)")
    } 🌐 English (Standard for global open-source & GitHub discovery)`,
  );
  console.log(
    `   ${colors.cyan("2)")} 🇪🇸 Español (Institucional / Corporativo)`,
  );

  const langChoice = promptUser("Selecciona idioma (1 o 2)", "1");
  const lang: "en" | "es" = langChoice === "2" ? "es" : "en";

  // 3. Tech Stack selection
  console.log(
    colors.bold(
      `\n3. Ecosistema de desarrollo detectado: ${
        colors.green(detectedStack.displayName)
      }`,
    ),
  );
  console.log(
    `   ¿Deseas usar esta configuración de pipeline para CI y Dependabot?`,
  );
  console.log(`   ${colors.cyan("1)")} Sí, usar ${detectedStack.displayName}`);
  console.log(`   ${colors.cyan("2)")} Rust / Cargo`);
  console.log(`   ${colors.cyan("3)")} Node.js / TypeScript / npm`);
  console.log(`   ${colors.cyan("4)")} Python`);
  console.log(`   ${colors.cyan("5)")} Go (Golang)`);
  console.log(`   ${colors.cyan("6)")} Deno / TypeScript`);

  const stackChoice = promptUser("Selecciona stack (1-6)", "1");
  let stack: TechStack = detectedStack.stack;
  if (stackChoice === "2") stack = "rust";
  else if (stackChoice === "3") stack = "node";
  else if (stackChoice === "4") stack = "python";
  else if (stackChoice === "5") stack = "go";
  else if (stackChoice === "6") stack = "deno";

  // 4. Git hooks selection
  const enableHooks = promptUser(
    "\n4. ¿Deseas activar Lefthook para validar Conventional Commits en local? (y/n)",
    "y",
  );
  const includeHooks = enableHooks.toLowerCase() !== "n";

  console.log(
    colors.bold(
      colors.cyan(
        "\n⚙️  Generando estándares con la configuración seleccionada...",
      ),
    ),
  );

  const result = await generateStandards({
    targetDir,
    mode,
    force: true,
    lang,
    stack,
    includeHooks,
  });

  console.log(
    colors.bold(
      colors.green(
        `\n🎉 ¡Operación completada exitosamente en modo ${result.mode.toUpperCase()}!`,
      ),
    ),
  );
  console.log(
    `   • Archivos generados: ${colors.green(String(result.written.length))}`,
  );
  console.log(
    `   • Stack configurado:  ${colors.cyan(result.context.stackDisplayName)}`,
  );
  console.log(
    `   • Idioma de docs:     ${
      colors.cyan(lang === "en" ? "English" : "Español")
    }`,
  );
  console.log(
    `   • Git Hooks:          ${
      colors.cyan(includeHooks ? "Lefthook activo" : "Desactivado")
    }\n`,
  );
}
