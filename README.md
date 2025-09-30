<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/Español-0ea5e9?style=for-the-badge&logo=github&logoColor=white" alt="Idioma Español" /></a>
  <a href="https://translate.google.com/translate?sl=es&tl=en&u=https://github.com/ASTAVIC/ASTAVIC-Sorteo"><img src="https://img.shields.io/badge/English-e63946?style=for-the-badge&logo=google-translate" alt="Language English" /></a>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1e293b,100:3b82f6&height=200&section=header&text=ASTAVIC%20Sorteo&fontSize=46&fontColor=ffffff&animation=twinkling&fontAlignY=35" alt="ASTAVIC Sorteo banner" />
</p>

<p align="center">
  <em>🎟️ Plataforma institucional para sorteos solidarios de ASTAVIC</em><br/>
  <sub>Gestión transparente de campañas, panel administrativo modular y experiencias accesibles para participantes.</sub>
</p>

<p align="center">
  <a href="https://github.com/ASTAVIC/ASTAVIC-Sorteo"><img src="https://img.shields.io/badge/Estado-Demo%20en%20proceso-2563eb?style=for-the-badge&logo=github" alt="Estado demo" /></a>
  <a href="#puesta-en-marcha"><img src="https://img.shields.io/badge/Comenzar-1c1917?style=for-the-badge&logo=npm&logoColor=white" alt="Guía de inicio" /></a>
  <a href="https://github.com/ASTAVIC/ASTAVIC-Sorteo/issues"><img src="https://img.shields.io/badge/Reportar%20problema-b91c1c?style=for-the-badge&logo=github" alt="Reportar problema" /></a>
</p>

---

## ✨ Highlights

<p align="center">
  <img src="https://img.shields.io/badge/Arquitectura-React%2019%20%2B%20Hooks-0ea5e9?style=for-the-badge&logo=react&logoColor=white" alt="Arquitectura React" />
  <img src="https://img.shields.io/badge/Panel%20Admin-Modular%20y%20responsivo-1d4ed8?style=for-the-badge&logo=vercel&logoColor=white" alt="Panel admin modular" />
  <img src="https://img.shields.io/badge/Enfoque-Accesibilidad%20%26%20Transparencia-15803d?style=for-the-badge&logo=accessible-icon&logoColor=white" alt="Accesibilidad" />
  <img src="https://img.shields.io/badge/Seguridad-Credenciales%20demo%20configurables-f97316?style=for-the-badge&logo=auth0&logoColor=white" alt="Credenciales demo" />
  <img src="https://img.shields.io/badge/Pruebas-RTL%20%2B%20Jest-9333ea?style=for-the-badge&logo=jest&logoColor=white" alt="Pruebas" />
</p>

> **DECISIÓN DE DISEÑO · Centralización de documentación:** Este README se trasladó a la raíz del repositorio para garantizar visibilidad inmediata en GitHub y consolidar la guía funcional y técnica en un único punto de referencia.

---

## Tabla de contenido

1. [Visión general](#visión-general)
2. [Arquitectura funcional](#arquitectura-funcional)
3. [Características destacadas](#características-destacadas)
4. [Tecnologías y buenas prácticas](#tecnologías-y-buenas-prácticas)
5. [Estructura de carpetas](#estructura-de-carpetas)
6. [Puesta en marcha](#puesta-en-marcha)
7. [Variables de entorno](#variables-de-entorno)
8. [Pruebas y control de calidad](#pruebas-y-control-de-calidad)
9. [Accesibilidad, UX y rendimiento](#accesibilidad-ux-y-rendimiento)
10. [Limitaciones conocidas](#limitaciones-conocidas)
11. [Próximos pasos sugeridos](#próximos-pasos-sugeridos)
12. [DECISIÓN DE DISEÑO](#decisión-de-diseño)

## Visión general

ASTAVIC Sorteo es una **plataforma demo en proceso** que centraliza la organización de sorteos temáticos y campañas de fidelización. Combina una experiencia pública pensada para participantes con un panel administrativo modular que permite operar sorteos en vivo, mantener listados actualizados y comunicar novedades de forma transparente.

### Objetivos clave

- Consolidar sorteos institucionales bajo una interfaz única, clara y responsive.
- Facilitar la administración delegando la lógica de negocio en hooks reutilizables y componentes desacoplados.
- Fomentar la confianza mediante historiales visibles, anuncios accesibles y flujos auditables.

## Arquitectura funcional

El proyecto se apoya en componentes funcionales de React 19 y una colección de hooks personalizados que encapsulan reglas de negocio:

- `App` orquesta el ruteo por *hash*, el estado global del sorteo en vivo y delega la lógica de negocio en hooks (SRP + KISS).
- `useHashRoute` resuelve la navegación `#/public`, `#/admin` y `#/finalizados` sin dependencias externas.
- `useRafflesManagement` concentra el ciclo de vida de los sorteos (crear, actualizar, eliminar, finalizar) con normalización de datos.
- `useLiveDraw` controla el sorteo en vivo con animaciones temporizadas y selección aleatoria de ganadores.
- `useSubscribersRegistry` y `useAdminSession` aíslan la gestión de suscriptores y la autenticación demo.
- `ToastContext` asegura mensajes accesibles y consistentes en toda la interfaz.

## Características destacadas

### Experiencia pública

- **Catálogo dinámico de sorteos**: separación entre sorteos vigentes y finalizados con orden cronológico automático.
- **Detalle enriquecido**: modales con premios, cantidad de ganadores, participantes y botones accesibles.
- **Recordatorios personalizados**: formulario de email con sanitización y validación antes de solicitar recordatorios generales o por sorteo.

### Panel administrativo

- **Autenticación demo configurable**: credenciales centralizadas en `src/config/adminCredentials.js` y sobre-escribibles por variables de entorno.
- **Tablero operativo**: estadísticas rápidas, asistente paso a paso y acceso directo a la creación de sorteos.
- **Gestión completa**: listado con filtros, edición inline, confirmaciones de eliminación y marcado manual de sorteos finalizados.
- **Sorteo en vivo**: modal dedicado que mezcla participantes, revela ganadores progresivamente y actualiza el estado del sorteo.

## Tecnologías y buenas prácticas

- **Framework**: [Create React App](https://create-react-app.dev/) (React 19, React Scripts 5).
- **Estilo**: CSS modularizado por secciones (`App.css`, `index.css`) con animaciones suaves.
- **Tipado en runtime**: `prop-types` para validar contratos de componentes.
- **Pruebas**: React Testing Library + Jest DOM para pruebas unitarias y de interacción.
- **Principios aplicados**: SOLID (hooks y contextos con responsabilidades acotadas), DRY (utilidades compartidas en `src/utils`), KISS (componentes declarativos y legibles).

## Estructura de carpetas

```text
sorteos-astavic/
├─ public/             # HTML base y assets estáticos
├─ src/
│  ├─ components/      # UI pública, panel admin, modales y elementos reutilizables
│  ├─ config/          # Credenciales demo y ajustes centralizados
│  ├─ context/         # Proveedores de Toast y sesión administrativa
│  ├─ data/            # Datos semilla (sorteos de ejemplo)
│  ├─ hooks/           # Hooks personalizados para ruteo, sorteos, draw en vivo, etc.
│  ├─ utils/           # Utilidades de validación y lógica de sorteos
│  ├─ App.js           # Orquestador principal
│  └─ index.js         # Punto de entrada de la aplicación
└─ package.json        # Dependencias y scripts de npm
```

## Puesta en marcha

1. **Requisitos**: Node.js ≥ 18 LTS y npm ≥ 9.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar el entorno de desarrollo (hot reload en `http://localhost:3000`):
   ```bash
   npm run dev
   ```
4. Generar build de producción optimizada:
   ```bash
   npm run build
   ```

## Variables de entorno

El panel administrativo utiliza credenciales demo que podés sobrescribir creando un archivo `.env` en la raíz del proyecto:

```dotenv
REACT_APP_ADMIN_EMAIL=admin@astavic.org
REACT_APP_ADMIN_PASSWORD=TuClaveSegura123
```

> *Las credenciales quedan embebidas en el bundle; para producción se recomienda un backend seguro con autenticación robusta.*

## Pruebas y control de calidad

- Ejecutar pruebas unitarias y de integración:
  ```bash
  npm test -- --watchAll=false
  ```
- Revisar calidad de código con ESLint (incluye reglas de `react-app`):
  ```bash
  npx eslint src --max-warnings=0
  ```

## Accesibilidad, UX y rendimiento

- Jerarquías semánticas (`<header>`, `<main>`, `<section>`) y etiquetas `aria-*` en modales y formularios.
- Botones con estados (`disabled`, focus ring) y contraste tipográfico para usuarios con baja visión.
- Animaciones breves (<300ms) que respetan la legibilidad y no bloquean la interacción.
- Optimización de renders mediante `useMemo` y `useCallback` en listas extensas y formularios.

## Limitaciones conocidas

- Los datos vuelven a su estado inicial al recargar la página (no hay persistencia).
- Las credenciales del panel admin solo brindan acceso demo; no hay gestión de roles ni auditoría.
- El envío de correos electrónicos y la asignación de recordatorios se simula localmente.

## Próximos pasos sugeridos

1. Integrar un backend (REST o GraphQL) para persistencia, registro de ganadores y métricas históricas.
2. Implementar doble opt-in y confirmaciones reales de correo para cumplir normativas anti-spam.
3. Añadir soporte multi-idioma (i18n) y personalización de plantillas de correo.
4. Incorporar pruebas end-to-end (Playwright o Cypress) para cubrir flujos críticos del panel administrativo.
5. Desplegar pipelines CI/CD con ejecución automática de lint, pruebas y análisis estático.

## DECISIÓN DE DISEÑO

- Centralizar el README en la raíz del repositorio mejora la experiencia de descubrimiento y alinea la documentación con las expectativas de la comunidad.
- Mantener la denominación "demo en proceso" comunica el estado real del proyecto y evita falsas expectativas sobre la disponibilidad en producción.
- El uso de insignias visuales estandarizadas facilita una lectura rápida sobre el stack, estado y enfoque del proyecto.

---

> **¿Preguntas o propuestas?** Abrí un issue o envía una propuesta de mejora para seguir evolucionando la plataforma.
