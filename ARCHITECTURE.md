# Arquitectura del Sistema ASTAVIC Sorteo

> *Este documento es la fuente de verdad arquitectónica. Toda decisión técnica debe alinearse con las reglas aquí descritas antes de ser implementada.*

## 1. Visión general del producto

La plataforma ASTAVIC Sorteo habilita la administración integral de sorteos institucionales para afiliados. La capa web actual está construida con React 19 (Create React App) y ofrece:

- **Vista pública** con sorteos activos/finalizados, detalles accesibles y registro de recordatorios.
- **Panel administrativo** con autenticación demo, creación/edición de sorteos y sorteos en vivo temporizados.
- **Lógica encapsulada en hooks** (`useRafflesManagement`, `useLiveDraw`, `useSubscribersRegistry`) y contextos (`ToastProvider`) que centralizan reglas de negocio reutilizables.

El roadmap contempla agregar persistencia real, comunicación por correo y métricas históricas mediante un backend Node.js + Express y una base de datos administrada.

## 2. Reglas inquebrantables

1. **Principios**: TODA contribución debe respetar SOLID, DRY, KISS y las guías de comentarios `better-comments` (`*, -*- , TODO, !, -!-, ?, -?-`).
2. **Versionado base**:
   - Node.js 20 LTS.
   - npm 10.
   - React 19.1.x.
   - Express 5 (cuando se incorpore backend).
   - Prisma 5 para la capa ORM (ver sección 5).
3. **Estilo de código**:
   - Componentes funcionales con hooks, sin clases.
   - Nomenclatura semántica en español neutro.
   - Comentarios solo para aclarar decisiones no obvias (en español), ubicados sobre el bloque que justifican.
4. **Arquitectura**:
   - Separación estricta entre capas `presentación` (React), `aplicación/servicios`, `dominio` y `infraestructura`.
   - Ningún componente UI accede directamente a fuentes externas; toda integración pasa por hooks/servicios específicos.
   - Validaciones y sanitización se realizan tanto en frontend como en backend.
5. **Tests**:
   - Nuevas funcionalidades deben incluir pruebas unitarias (Jest/RTL) y, en backend, pruebas de servicios (Vitest/Jest) y de integración contra la base de datos (con contenedores efímeros o testcontainers).
6. **Accesibilidad**: WCAG 2.2 AA como mínimo; cualquier componente nuevo debe documentar variantes de foco y navegación por teclado.
7. **Seguridad**:
   - Configuración secreta vía variables de entorno (`.env.local` en frontend, `.env` en backend).
   - Jamás exponer claves privadas en el cliente ni versionar archivos `.env`.
   - Sanitizar entradas y aplicar validaciones schema-driven (Zod/Prisma validators).

## 3. Arquitectura actual del frontend

### 3.1. Organización de carpetas

- `src/components`: UI separada por dominios (`public`, `admin`, `ui`).
- `src/hooks`: Hooks especializados que concentran estado y efectos colaterales.
- `src/context`: Proveedores globales (p.ej. toasts) para evitar prop drilling.
- `src/utils`: Utilidades puras y testables (formatos de fecha, selección de ganadores, validaciones).
- `src/data`: Semillas in-memory para demo.

### 3.2. Flujo de datos

1. `App` instancia hooks de dominio (sorteos, draw, sesión, suscriptores) y define rutas `#/` (público) y `#/admin`.
2. `useRafflesManagement` mantiene el estado fuente de sorteos y deriva vistas `activeRaffles`/`finishedRaffles`.
3. `useLiveDraw` invoca `pickWinners` y emite eventos de finalización (`markFinished`).
4. Formularios de suscripción emplean `useSubscribersRegistry` para validar/sanitizar correos localmente.
5. `ToastProvider` expone `showToast/hideToast`, renderizando `<Toast />` al final de la jerarquía.

### 3.3. Puntos de extensión

- Hooks están preparados para recibir adaptadores (p.ej. `useRafflesManagement` podría aceptar repositorios asincrónicos).
- La navegación por hash evita configuración de backend en Vercel, pero admite refactor a router real cuando exista API.
- El módulo `config/adminCredentials` ya consulta variables de entorno, facilitando integración con backend real.

## 4. Arquitectura objetivo (full-stack)

### 4.1. Diagrama lógico de capas

```
Cliente (React) ──REST/HTTPS──> API Gateway (Express) ──> Servicios de Aplicación
                                               │
                                               ├─> Casos de uso / Dominio (coordinan reglas de negocio)
                                               │
                                               └─> Adaptadores de Infraestructura
                                                     ├─ Prisma Client (PostgreSQL)
                                                     ├─ Proveedor de emails (Resend/SendGrid)
                                                     └─ Sistema de archivos/Storage (opcional)
```

### 4.2. Carpetas propuestas (monorepo)

```
ASTAVIC-Sorteo/
├─ ARCHITECTURE.md
├─ sorteos-astavic/          # Frontend (React)
└─ api/                      # Backend Node.js + Express
   ├─ src/
   │  ├─ app/               # Configuración Express, middlewares
   │  ├─ modules/           # Bounded contexts (raffles, subscribers, auth)
   │  │  └─ raffle/
   │  │     ├─ domain/     # Entidades, interfaces de repositorio
   │  │     ├─ application/# Casos de uso (createRaffle, drawWinners, etc.)
   │  │     ├─ infrastructure/
   │  │     │  ├─ prisma/  # Repositorio Prisma
   │  │     │  └─ http/    # Controladores/routers Express
   │  │     └─ tests/      # Unit & integration tests
   │  ├─ shared/           # Utilidades, errores personalizados, validadores
   │  └─ config/           # Carga de env, logging, CORS
   ├─ prisma/              # Esquema y migraciones
   └─ package.json
```

### 4.3. Integración frontend-backend

- Los hooks actuales evolucionarán a clientes API:
  - `useRafflesManagement` delegará en servicios REST (`GET/POST/PATCH/DELETE /raffles`).
  - `useSubscribersRegistry` consumirá `POST /subscriptions` y gestionará mensajes en base a la respuesta.
  - `useLiveDraw` invocará `POST /raffles/:id/draw` y recibirá la lista de ganadores persistida.
- Autenticación migrará a tokens (JWT firmados en backend). El frontend almacenará tokens en `sessionStorage` con refresh controlado.

## 5. DECISIÓN DE DISEÑO: Base de datos

### 5.1. Análisis comparativo

| Criterio | PostgreSQL + Prisma | MongoDB + Mongoose |
| --- | --- | --- |
| Modelo de datos | Relacional estructurado; ideal para sorteos, participantes, suscripciones y reportes históricos. | Documentos flexibles; requeriría modelar manualmente relaciones y agregados para reportes. |
| Tipos nativos | Manejo preciso de fechas, enums y constraints (`CHECK`, `UNIQUE`). | Fechas y validaciones menos estrictas; dependemos de validaciones a nivel aplicación. |
| ORM/ODM | Prisma ofrece tipado estático, migraciones declarativas y generador de clientes. | Mongoose requiere schemas manuales, carece de tipado nativo y migraciones integradas. |
| Ecosistema gratis | Servicios como [Neon](https://neon.tech/), [Supabase](https://supabase.com/pricing) y [Railway](https://railway.app/pricing) poseen planes free suficientes (con backups automáticos). | MongoDB Atlas dispone de free tier, pero con límites más bajos de almacenamiento y rendimiento para consultas agregadas. |
| Reportes futuros | Consultas SQL complejas y vistas materializadas facilitan informes y auditoría. | Requiere pipelines de agregación complejos; mantenimiento superior. |

### 5.2. Elección

> **Se adopta PostgreSQL administrado con Prisma Client.**

**Motivos clave:**
- El dominio requiere relaciones fuertes (sorteos ↔ premios ↔ participantes ↔ registros de ganadores), lo que favorece un modelo relacional normalizado.
- Prisma genera tipos y validaciones automáticas, reduciendo boilerplate y favoreciendo DRY/SOLID.
- Los proveedores gratuitos (Neon/Supabase) simplifican la creación de entornos dev/staging con backups y escalado básico.
- PostgreSQL facilita cumplir normativas (integridad referencial, auditoría de cambios con triggers, vistas) sin construir lógica manual.

### 5.3. Esquema inicial (borrador)

```
model Raffle {
  id             String   @id @default(cuid())
  slug           String   @unique
  title          String
  description    String
  scheduledAt    DateTime
  winnersCount   Int
  prizes         Prize[]
  participants   ParticipantEnrollment[]
  draws          Draw[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Prize {
  id        String @id @default(cuid())
  title     String
  raffle    Raffle @relation(fields: [raffleId], references: [id])
  raffleId  String
}

model ParticipantEnrollment {
  id          String @id @default(cuid())
  email       String
  fullName    String?
  raffle      Raffle @relation(fields: [raffleId], references: [id])
  raffleId    String
  subscribedAt DateTime @default(now())
}

model Draw {
  id          String @id @default(cuid())
  raffle      Raffle @relation(fields: [raffleId], references: [id])
  raffleId    String
  executedAt  DateTime @default(now())
  winners     DrawWinner[]
  status      DrawStatus @default(SCHEDULED)
  message     String?
}

model DrawWinner {
  id              String @id @default(cuid())
  draw            Draw   @relation(fields: [drawId], references: [id])
  drawId          String
  participant     ParticipantEnrollment @relation(fields: [participantId], references: [id])
  participantId   String
  position        Int
}

enum DrawStatus {
  SCHEDULED
  RUNNING
  FINISHED
  CANCELLED
}

model Subscriber {
  id        String @id @default(cuid())
  email     String  @unique
  confirmed Boolean @default(false)
  token     String?
  createdAt DateTime @default(now())
}
```

- Migraciones versionadas (`prisma migrate`) obligatorias en todo cambio estructural.
- Datos sensibles cifrados en repositorios (p.ej. tokens de confirmación).

## 6. DECISIÓN DE DISEÑO: Backend Node + Express

1. **Framework**: Express 5 con middlewares tipados (TypeScript recomendado para backend, manteniendo front en JavaScript mientras se evalúa migración).
2. **Validación**: Zod para esquemas de request/response; integra con Prisma y evita duplicar lógica.
3. **Autenticación**:
   - Login admin con JWT firmado (HS256) y expiración corta + refresh tokens almacenados en cookies httpOnly.
   - Opción de incorporar OAuth institucional si el cliente lo requiere.
4. **Servicios clave**:
   - `RaffleService`: CRUD, carga masiva de participantes, ejecutar sorteos.
   - `SubscriptionService`: doble opt-in, recordatorios, bajas.
   - `NotificationService`: integra con proveedor de emails.
   - `AuditService`: registra eventos críticos (login, draw, eliminaciones) en tabla dedicada.
5. **Middlewares obligatorios**: rate limiting (p.ej. `express-rate-limit`), helmet, cors granular, logging estructurado (pino).
6. **Error handling**: capa única que transforma errores de dominio en respuestas HTTP (400/409/500) y registra stack traces.

## 7. DECISIÓN DE DISEÑO: Envío de correos

- **Proveedor**: Resend (free tier de 3.000 emails/mes) o Brevo (300 diarios). Elegir según restricciones de dominio.
- **Patrón**: servicio especializado (`EmailService`) con puerto/adapter. El dominio solo conoce interfaz `EmailClient`.
- **Plantillas**: MJML/Handlebars renderizadas en backend; versionar plantillas y probar con Storybook (opcional).
- **Flujos**:
  1. Registro → email de confirmación (doble opt-in).
  2. Sorteo próximo → recordatorio N horas antes.
  3. Sorteo ejecutado → notificación a ganadores y staff.
- **Reintentos**: usar colas ligeras (BullMQ + Redis) cuando el tráfico lo requiera; inicialmente bastará con reintentos en memoria + alertas.

## 8. Infraestructura y DevOps

- **Environments**: `development`, `staging`, `production` con variables de entorno independientes.
- **CI/CD**: GitHub Actions ejecutando lint, pruebas, `prisma migrate diff` y despliegue automatizado (frontend a Vercel, backend a Render/Fly.io/ Railway).
- **Observabilidad**: logs estructurados (JSON), métricas básicas (p95 de respuestas) y alertas en errores 5xx. Integrar Sentry para front/back.
- **Backups**: habilitar backups automáticos diarios en la instancia PostgreSQL.

## 9. Estrategia de pruebas

- **Frontend**: mantener suite Jest/RTL y agregar pruebas de hooks críticos (mock de API) y pruebas de accesibilidad (jest-axe).
- **Backend**:
  - Unit tests para casos de uso (sin tocar DB).
  - Integration tests con base PostgreSQL efímera (Testcontainers) y seeds.
  - Contratos API con Pact o Schemathesis.
- **End-to-end**: Playwright cubriendo flujos público/admin con backend real en staging.

## 10. Seguridad y cumplimiento

- CORS restringido a dominios conocidos.
- Rate limiting adaptativo por IP/usuario.
- Sanitización de inputs (XSS, SQLi) + escaping en correos/plantillas.
- Auditoría de accesos y cambios sensibles, con retención mínima de 12 meses.
- Conformidad con Ley de Protección de Datos Argentina (Ley 25.326) y GDPR para suscriptores.

## 11. Rendimiento y escalabilidad

- Cache de lecturas públicas (CDN + HTTP caching, ETag) y cache interno (Redis) para listados de sorteos.
- Uso de paginación y `cursor-based pagination` en endpoints de participantes.
- Optimizar consultas con índices compuestos (`raffleId`, `executedAt`).
- Frontend: dividir código por rutas, usar React.lazy para vistas administrativas.

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Falta de persistencia actual genera inconsistencias entre usuarios. | Implementar backend MVP con PostgreSQL y endpoints CRUD priorizados. |
| Emails marcados como spam. | Doble opt-in, dominios verificados (SPF, DKIM) y monitoreo de reputación. |
| Escalamiento de tráfico durante sorteos masivos. | Pre-cargar datos en cache, usar WebSockets opcionalmente para streaming, validar capacidad del proveedor DB. |
| Fuga de credenciales demo. | Reemplazar por autenticación real y almacenar secretos en vault (Doppler/GitHub Secrets). |

## 13. Roadmap recomendado

1. **Sprint 1**: Scaffold backend (`api/`), configurar Express, Prisma, migraciones iniciales y CRUD básico de sorteos.
2. **Sprint 2**: Integrar frontend con API, reemplazar semillas locales por datos remotos, añadir autenticación JWT.
3. **Sprint 3**: Implementar suscripciones con doble opt-in y servicio de emails.
4. **Sprint 4**: Ejecutar sorteos persistentes y generar reportes básicos (historial, exportaciones CSV).
5. **Sprint 5**: Observabilidad, monitoreo y endurecimiento de seguridad (rate limiting, auditoría completa).

## 14. Oportunidades de mejora detectadas

- Migrar gradualmente el frontend a TypeScript para tipos compartidos con Prisma.
- Introducir Storybook para documentar componentes reutilizables (botones, modales) y garantizar consistencia visual.
- Refactorizar estilos hacia CSS Modules o Tailwind para mejorar mantenibilidad.
- Implementar feature flags para experimentos (p.ej. variantes de sorteos).

---

> *Cualquier modificación estructural debe incorporar una nueva sección `DECISIÓN DE DISEÑO` con la justificación, impacto y plan de reversión.*
