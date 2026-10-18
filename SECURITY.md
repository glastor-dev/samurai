# 🛡️ Política de Seguridad (Security Policy)

## Compromiso de Seguridad y Divulgación Responsable

La seguridad, integridad y resiliencia de la **Software Supply Chain** de
**SAMURAI** es una prioridad institucional absoluta. Agradecemos el esfuerzo de
la comunidad y de investigadores de seguridad independientes por reportar
vulnerabilidades de manera ética y confidencial.

---

## 🔒 Versiones con Soporte Activo

Mantenemos activamente parches de seguridad para las siguientes ramas y
versiones:

| Versión                            | Estado de Soporte | Tipo de Mantenimiento                            |
| :--------------------------------- | :---------------: | :----------------------------------------------- |
| **Latest (main / main)**           |     ✅ Activo     | Parches inmediatos de seguridad y dependencias   |
| **Versión mayor anterior (v-1.x)** |    🛡️ Crítico     | Parches de vulnerabilidades severas (CVSS ≥ 7.0) |
| **Versiones heredadas (< v-1.x)**  |  ❌ Sin Soporte   | Fin del ciclo de vida (EOL). Migración requerida |

---

## 🚨 Protocolo para Reportar Vulnerabilidades

> ⚠️ **IMPORTANTE:** **NO** abras un ticket público en GitHub Issues para
> reportar vulnerabilidades de seguridad que puedan comprometer la
> confidencialidad, integridad o disponibilidad de sistemas en producción.

### Canal Preferido: GitHub Private Vulnerability Reporting (PVR)

Utiliza la herramienta nativa de GitHub para apertura segura y cifrada de
reportes:

1. Dirígete a la pestaña **Security** del repositorio:
   [https://github.com/glastor-dev/samurai/security/advisories](https://github.com/glastor-dev/samurai/security/advisories).
2. Haz clic en **Report a vulnerability**.
3. Completa los detalles técnicos, vector de ataque y prueba de concepto (PoC).

### Canal Alternativo Directo:

Si no dispones de cuenta con acceso a Security Advisories o requieres cifrado
PGP/GPG:

- **Email de Seguridad:**
  [glastor.info@gmail.com](mailto:glastor.info@gmail.com)
- **Asunto:** `[SECURITY-ALERT] samurai - CVE / Vulnerabilidad`

---

## 📋 Requisitos para el Reporte Técnico

Para acelerar el triaje y la remediación, incluye:

1. **Descripción del impacto:** Severidad estimada según métricas **CVSS v3.1 /
   v4.0**.
2. **Pasos para reproducir:** Prueba de concepto determinista (script mínimo,
   payload o secuencia HTTP).
3. **Entorno afectado:** Sistema Operativo, Runtime, versiones específicas
   afectadas.
4. **Propuesta de remediación (opcional):** Parche o mitigación temporal si está
   disponible.

---

## ⏱️ Acuerdos de Nivel de Servicio (SLA)

- **Acuse de recibo inicial:** Dentro de las **24 a 48 horas hábiles**.
- **Evaluación y triaje:** Dentro de los **5 días hábiles**.
- **Coordinación de divulgación:** Fijamos un período de gracia de **90 días**
  para publicar el parche y notificar a los usuarios antes de cualquier
  divulgación pública coordinada.

---

© 2026 Glastor - Todos los derechos reservados.
