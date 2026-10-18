# 📐 Arquitectura de Mensajes de Commit (Conventional Commits)

Para escalar el desarrollo y garantizar una **Software Supply Chain**
transparente y auditable, este repositorio implementa una convención estricta
basada en el estándar
[Conventional Commits v1.0.0](https://www.conventionalcommits.org/). Esta
práctica impulsa de forma determinista la generación automatizada de changelogs,
el cálculo de **Semantic Versioning (SemVer)** y la trazabilidad de auditorías
DevSecOps.

---

## 🔍 Especificación Técnica y Expresión Regular de Validación

Todo aporte y commit debe superar el esquema de validación definido por la
siguiente expresión regular antes de integrarse en la rama `main`:

```js
/^(revert: )?(feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types)(\([\w.-]+\))?: .{1,50}$/;
```

### Parámetros de Calidad:

- **Scope (Opcional):** Contexto modular del cambio entre paréntesis (ej.
  `core`, `cli`, `api`, `deps`).
- **Encabezado (Subject):** Máximo 50 caracteres, modo imperativo, sin punto
  final.
- **DX-First:** Un historial de commits limpio facilita el análisis con
  `git bisect` y la ejecución de `cherry-pick`.

---

## 🏗️ Estructura del Mensaje

```text
<tipo>(<scope>): <asunto breve>

<cuerpo detallado explicando la motivación técnica y el impacto>

<footer>
```

### Catálogo de Tipos y Comportamiento en Release:

| Tipo              | Impacto DX / Descripción                                | ¿Aparece en Changelog? |
| :---------------- | :------------------------------------------------------ | :--------------------: |
| `feat`            | Nueva funcionalidad expuesta al usuario.                |     **Sí (Minor)**     |
| `fix`             | Resolución de un bug o regresión.                       |     **Sí (Patch)**     |
| `perf`            | Optimización de rendimiento o consumo de memoria.       |         **Sí**         |
| `refactor`        | Reestructuración de código sin alterar comportamiento.  |           No           |
| `docs`            | Actualización de documentación técnica o diagramas.     |           No           |
| `test`            | Añadido o corrección de pruebas automatizadas.          |           No           |
| `ci` / `workflow` | Modificaciones en pipelines de CI/CD de GitHub Actions. |           No           |
| `chore`           | Mantenimiento de herramientas, scripts o metadatos.     |           No           |
| `types`           | Refinamiento de interfaces y definiciones TypeScript.   |           No           |
| `polish`          | Ajustes cosméticos o mejoras menores de UX.             |           No           |

> 💥 **Breaking Changes:** Cualquier commit que incluya `BREAKING CHANGE:` al
> inicio del footer forzará automáticamente una subida de versión mayor (**Major
> Release**), sin importar el tipo.

---

## 🔐 Firma Criptográfica de Commits (Verified Badge)

Conforme a las directrices de seguridad de la cadena de suministro de GitHub, se
recomienda firmar digitalmente cada commit utilizando llaves **SSH** o **GPG**
para garantizar la autenticidad e integridad del autor.

© 2010-2026 Glastor - Todos los derechos reservados.
