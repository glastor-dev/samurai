# 🚀 Guía y Estándares de Contribución

Gracias por sumarte a la misión de impulsar y escalar **SAMURAI**. Valoramos la
excelencia técnica, el rigor arquitectónico y el compromiso con la calidad. Esta
guía establece el marco de trabajo para optimizar la **Developer Experience
(DX)** y garantizar la estabilidad del software.

---

## 📌 Gestión Estratégica de Incidencias

### Reportes de Errores (Fidelidad Técnica)

Para optimizar el triaje y la resolución, exigimos reportes con máxima fidelidad
técnica:

- **Executive Summary:** Breve descripción del impacto y alcance de la
  incidencia.
- **Protocolo de Reproducción:** Secuencia determinística de pasos mínimos.
- **Análisis de Desviación:** Contraste claro entre el comportamiento observado
  vs. el esperado.
- **Stack Tecnológico:** Versión exacta del Runtime (Deno/Node), Sistema
  Operativo y commit hash.
- **Evidencia Técnica:** Logs de terminal, trazas de error completas o
  reproducciones mínimas aisladas.

### Propuestas de Nuevas Funcionalidades

Si deseas proponer un cambio estructural, te invitamos a abrir primero un ticket
de discusión o issue con un breve _Design Doc_:

- **Valor Agregado:** Justificación de la necesidad y retorno técnico.
- **Casos de Uso:** Escenarios concretos donde la mejora es requerida.
- **Compatibilidad:** Consideraciones sobre retrocompatibilidad y posibles
  _breaking changes_.

---

## 🛠️ Pipeline de Integración (Pull Requests)

Seguimos un flujo de trabajo riguroso para mantener verde la rama principal
(`main`):

1. **Crear Rama Temática (Semantic Branching):**
   ```bash
   git checkout -b feat/nueva-funcionalidad
   # o fix/descripcion-del-bug
   ```

2. **Garantía de Calidad Local:** Antes de abrir el PR, verifica que todos los
   checks pasen sin advertencias:
   ```bash
   # En entornos Deno:
   deno fmt --check
   deno lint
   deno test -A
   ```

3. **Commits Convencionales:** Sigue estrictamente la especificación en
   [.github/COMMIT_CONVENTION.md](COMMIT_CONVENTION.md):
   ```bash
   git commit -m "feat(core): implement deterministic schema validation"
   ```

4. **Sincronización:** Envía tus cambios a tu fork y abre el PR contra la rama
   `main`.

---

## 📐 Principios de Ingeniería y DX

- **Clean Code & SOLID:** Modularidad atómica, funciones puras y tipado estricto
  sin uso injustificado de `any`.
- **Atomicidad en PRs:** Un PR debe resolver una única responsabilidad.
- **Actualización de Documentación:** Todo cambio en la API pública debe
  reflejarse en los ejemplos y en el README.

---

© 2010-2026 Glastor - Todos los derechos reservados.
