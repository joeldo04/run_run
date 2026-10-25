# RUNCTY — PROYECTO REAL MEJORADO (NO ES UNA DEMO HTML)

Este ZIP conserva el proyecto real React 19 / Next.js 16 + Payload CMS exportado de Figma Make.
No es un `index.html` sustitutivo; los módulos, pantallas, rutas, estado, mapas y colecciones siguen en `src/`.

## Cambios realizados

- **Reparación crítica:** `src/app/(frontend)/styles.css` importa ahora TODOS los CSS al inicio, antes de las reglas. El archivo de recuperación anterior se importaba al final y podía ser ignorado por el navegador/procesador.
- Paleta RUNCTY: azul noche, azul eléctrico, naranja deportivo, violeta selectivo (sin borrar la identidad original).
- **Perfil:** tarjetas con métricas separadas, encabezado, gráfico semanal y estado vacío con acción.
- **Reportar incidente:** paso a paso con `aria-current`, opciones seleccionables (`aria-pressed`), tarjetas legibles incluso en 375 px.
- **Entrenamiento:** estilos para resultados y distribución de seguridad.
- **Patrocinadores:** composición adaptable; evitar columnas estrechas.
- Móvil: solo aplicación, no landing lateral. Barra inferior naranja/azul, espacio seguro y sin desbordamiento.
- Se mantiene Leaflet/OpenStreetMap en el código real y el panel web del club.
- Se cambiaron los comandos npm a formato compatible con Windows (el ZIP original usaba sintaxis de shell de Linux en `pnpm dev`).

Archivos esenciales editados: `styles.css`, `runcty.css`, `runcty-recovery.css` (conservado), `runcty-polish.css` (nuevo), `screens.tsx`, `reports.tsx`, `App.tsx`.
También conserva las mejoras previas de datos demo y cartografía de `store.tsx`, `demo-seed.ts`, `SafetyMapCanvas.tsx`.

## Cómo abrir en Windows

1. Instalar **Node.js >= 24.22.1** y **pnpm 10**.
2. Extraer ZIP y abrir la carpeta que contiene `package.json` en VS Code.
3. Terminal: `npm install -g pnpm@10`
4. Terminal: `pnpm install`
5. Terminal: `pnpm dev`
6. Entrar en `http://localhost:3000`.

**Limitación importante:** `src/payload.config.ts` todavía usa `@payloadcms/figma` / `buildFigmaConfig` y servicios/variables del entorno de Figma. En un ordenador externo, el frontend puede fallar durante el arranque si no se adapta esa configuración y su base de datos. Este ZIP no garantiza un arranque independiente ni incluye los datos originales del CMS. No es una aplicación Android nativa ni un APK.

## Verificaciones realizadas

Las comprobaciones estáticas de sintaxis TypeScript/TSX y CSS se documentan por separado cuando estén disponibles. No se ha certificado la compilación Next.js ni la revisión visual con el servidor: este entorno no dispone de acceso a npm y el proyecto requiere Node >=24.22.1.

## Qué NO se hizo

No se borró el frontend original, no se cambió de framework y no se simuló el backend como si fuera real. No se reescribieron desde cero la navegación, la lógica de rutas, la moderación o los entrenamientos.
