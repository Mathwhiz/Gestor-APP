# Prototipo Hoy - Preparacion de Producto y Tecnica

## Actualizacion - Abril 2026

El prototipo ya dejo de ser solo visual y hoy tiene varias piezas operativas reales:

- persistencia con Prisma y PostgreSQL
- alta, edicion y archivado en modulos clave
- dashboard con alertas, caja y seguimiento
- plantillas de tramites con checklist inicial
- historial unificado en contactos y vehiculos
- fichas de tramites con notas, movimientos y timeline
- finanzas y operaciones mas ordenadas visualmente
- prioridad diaria y agenda mas clara para trabajar el dia
- reporte mensual liviano sin convertir la app en sistema contable pesado
- busqueda global ampliada para ubicar tambien tareas y ayudas

Tambien queda definida una restriccion importante:

- no conviene usar la base free de 500 MB para guardar archivos pesados
- si mas adelante se suma documentacion real, conviene separar base de datos y storage

## Objetivo de hoy

Llegar a un prototipo web navegable, consistente y creible de la app para:

- gestoría del automotor
- agencia de autos
- control financiero operativo
- ayudas para tramites

No es necesario resolver toda la persistencia ni toda la logica de negocio hoy. La prioridad es construir una base visual y funcional clara que luego pueda crecer sin rehacerse.

## 1. Decision tecnica recomendada

### Stack recomendado para arrancar

- Next.js
- TypeScript
- Tailwind
- PostgreSQL como base recomendada a mediano plazo
- datos mockeados para el prototipo inicial

### Decision concreta

Para hoy:

- construir primero frontend con datos mockeados
- dejar la estructura lista para conectar base despues

Para persistencia futura:

- si se quiere ir rapido y aprovechar experiencia previa, Firestore es viable
- si se prioriza crecimiento ordenado en relaciones y reportes, PostgreSQL es mejor

### Eleccion pragmatica

La recomendacion base para este proyecto es:

- arquitectura pensada para PostgreSQL
- prototipo de hoy sin depender todavia de la base

Asi no se frena el avance y no se toma una decision de infraestructura antes de validar la UI y el flujo.

## 2. Arquitectura inicial recomendada

### Estructura general

- app web monolitica
- layout principal con sidebar y topbar
- modulos organizados por dominio
- datos mock centralizados
- componentes UI reutilizables

### Modulos de dominio iniciales

- dashboard
- contactos
- vehiculos
- tramites
- finanzas
- ayudas
- tareas

### Modulos ya reforzados en esta etapa

- `dashboard` con alertas operativas y reporte por area
- `tramites` con plantillas, checklist y archivo
- `operaciones` con seguimiento comercial y archivo
- `finanzas` con lectura de caja por area y archivo
- `contactos` y `vehiculos` con historial unificado
- `tareas` con agenda ordenada por vencimiento

### Estructura de carpetas sugerida

- `app/` o `src/app/` para rutas y layout
- `components/` para componentes compartidos
- `features/` para logica y vistas por modulo
- `lib/` para utilidades y helpers
- `data/` para mocks y catalogos iniciales
- `styles/` para tokens y estilos globales

## 3. Sitemap final del prototipo

El prototipo de hoy deberia cubrir estas rutas o pantallas:

### Rutas principales

- `/login`
- `/dashboard`
- `/tramites`
- `/tramites/[id]`
- `/contactos`
- `/vehiculos`
- `/finanzas`
- `/ayudas`
- `/tareas`

### Pantallas que pueden esperar

- agencia completa
- reportes completos
- configuracion
- documentos avanzados

## 4. Flujo principal que debe verse en el prototipo

### Flujo 1

Entrar al dashboard y entender el estado del dia.

### Flujo 2

Ir al listado de tramites y filtrar por urgentes, observados o pendientes.

### Flujo 3

Abrir una ficha de tramite y ver:

- cliente
- vehiculo
- estado
- checklist
- gastos e ingresos
- tareas
- ayuda contextual

Estado actual:

- ya existe checklist activo
- ya existe historial de eventos
- ya se pueden cargar notas y movimientos
- ya se muestran alertas operativas
- ya se ve la plantilla aplicada al tramite

### Flujo 4

Ir a finanzas y registrar visualmente el orden economico del dia.

Estado actual:

- ya se pueden cargar, editar y archivar movimientos
- ya hay lectura por area de negocio
- ya hay panel de cobros pendientes y presion documental

### Flujo 5

Ir a ayudas y consultar rapidamente una guia operativa.

Estado actual:

- las ayudas ya se conectan mejor con tramites creados por plantilla

## 5. Design system base compartido

La interfaz tiene que sentirse como una herramienta administrativa moderna, sobria y consistente.

### Direccion visual

- estilo profesional y claro
- escritorio primero
- alta legibilidad
- densidad media de informacion
- foco en tablas, estados, filtros y resumenes
- nada de estilo de landing ni panel generico colorido

### Paleta sugerida

Base:

- fondo calido claro
- superficies blancas o marfil muy suave
- texto principal gris oscuro
- texto secundario gris neutro
- bordes suaves

Acentos funcionales:

- azul petroleo o azul acero para accion principal
- verde sobrio para terminado o cobrado
- ambar para pendiente o advertencia
- rojo ladrillo para observado o vencido

### Tipografia

- sans moderna, sobria y legible
- jerarquia clara entre encabezados, datos y etiquetas
- numeros con buena legibilidad para importes y fechas

### Tokens funcionales

- radio consistente
- espaciado uniforme
- sombras minimas
- badges con codigo de color por estado
- tablas con filas limpias y hover suave

## 6. Componentes UI compartidos

Estos componentes deberian usarse en todos los modulos:

- `AppShell`
- `Sidebar`
- `Topbar`
- `PageHeader`
- `SummaryCard`
- `DataTable`
- `FilterBar`
- `SearchInput`
- `StatusBadge`
- `PriorityBadge`
- `SectionCard`
- `DetailGrid`
- `Timeline`
- `ChecklistPanel`
- `HelpPanel`
- `EmptyState`
- `QuickActionMenu`

Componentes y patrones que efectivamente quedaron consolidados:

- `PageHeader`
- `SummaryCard`
- `SectionCard`
- `StatusBadge`
- tarjetas de alerta operativa
- timeline operativo
- composer plegable para altas rapidas
- filtros con separacion entre activos y archivados

## 7. Reglas de consistencia entre modulos

- todos los listados usan el mismo patron de tabla
- todos los headers de pagina usan la misma estructura
- los badges de estado significan lo mismo en toda la app
- las acciones primarias van siempre en el mismo lugar
- las fichas usan tarjetas o bloques con una grilla consistente
- la ayuda contextual debe verse igual en cualquier tramite

Reglas agregadas en la implementacion real:

- activos y archivados no se mezclan por defecto
- las vistas densas deben tener lectura superior con resumen y despues listado
- las fichas de contacto y vehiculo deben contar la historia, no solo listar items sueltos
- las alertas tienen que priorizar vencimiento, observacion, documentacion y cobro

## 8. Catalogos iniciales del prototipo

### Areas de negocio

- gestoria
- agencia
- general
- personal

### Prioridades

- baja
- media
- alta
- urgente

### Estados de tramite

- borrador
- pendiente de documentacion
- listo para presentar
- presentado
- observado
- en gestion externa
- terminado
- entregado
- cancelado

## 9. Datos demo minimos a preparar

### Contactos demo

- Carlos Fernandez, cliente particular
- Mariana Lopez, clienta recurrente
- Agencia Ruta 5, tercero derivador
- Registro Seccional Santa Rosa 2
- Estudio Contable Suarez

### Vehiculos demo

- Ford Ranger 2019, transferencia en curso
- Toyota Corolla 2021, stock de agencia
- Volkswagen Gol 2016, documentacion incompleta

### Tramites demo

- transferencia de Ford Ranger, pendiente de documentacion
- duplicado de cedula de Gol, presentado
- denuncia de venta, terminado
- patentamiento, observado

### Tareas demo

- llamar cliente por firma pendiente
- llevar carpeta al registro
- revisar observacion de patentamiento
- cobrar honorarios atrasados

### Movimientos demo

- cobro de honorarios
- pago de formularios
- combustible o gasto comun
- alquiler o servicio

## 10. Mejoras ya implementadas respecto del plan inicial

### Borrado logico / archivo

Ya se puede archivar y reactivar:

- contactos
- tareas
- guias
- vehiculos
- tramites
- operaciones
- movimientos

### Descompresion de pantallas

Se mejoro especialmente:

- `finanzas`
- `operaciones`

Con enfoque en:

- resumen arriba
- listados abajo
- menos mezcla de acciones y lectura
- filtros mas claros

### Reportes y control

El dashboard y finanzas ya muestran:

- caja operativa
- documentos pendientes
- tramites observados
- tramites sin cobro
- margen abierto
- caja por area
- reporte mensual liviano

### Flujo diario reforzado

Quedaron agregados patrones para que la app sirva mejor en el uso cotidiano:

- panel de prioridad del dia
- agenda inmediata cruzada
- tareas agrupadas en hoy, manana y proximas
- busqueda global mas amplia
- vinculo mas directo entre operacion y tramite

### Historial de relacion

Las fichas de `contactos` y `vehiculos` ya tienen una vista de historial unificado para seguir mejor cada caso.

- cobro de honorarios por transferencia
- pago de formularios
- gasto de combustible
- comision pagada a tercero
- pago de alquiler

### Guias demo

- transferencia
- duplicado de cedula
- denuncia de venta

## 10. Datos y campos que deben verse en cada pantalla

### Dashboard

- cards de resumen
- tramites urgentes
- tareas de hoy
- alertas
- ultimos movimientos
- accesos a ayudas frecuentes

### Tramites

- tabla principal
- filtros
- indicadores de estado y prioridad

### Ficha de tramite

- resumen superior
- timeline de estados
- checklist documental
- panel de ayuda lateral o bloque secundario
- caja de movimientos

### Finanzas

- tabla de movimientos
- chips o badges por categoria
- separacion por area de negocio

### Ayudas

- lista de guias
- ficha detallada de una guia
- links utiles
- observaciones practicas

## 11. Consideraciones por La Pampa y operacion nacional

La app debe asumir:

- base operativa en La Pampa
- posibilidad de tramites en otras provincias
- diferencias practicas por jurisdiccion

Por eso el prototipo deberia contemplar en los datos demo:

- campo de jurisdiccion
- notas por organismo o registro
- links especificos por tramite

## 12. Criterios de exito del prototipo de hoy

El prototipo esta bien encaminado si:

- se entiende la propuesta en menos de 2 minutos
- dashboard, tramites y finanzas se sienten parte del mismo sistema
- la ficha de tramite muestra el verdadero centro operativo del negocio
- el modulo de ayudas se integra naturalmente
- no parece una demo generica reciclada

## 13. Orden recomendado a partir de ahora

1. crear la base del proyecto
2. montar layout y navegacion
3. definir tokens visuales y componentes compartidos
4. cargar datos mock
5. construir dashboard
6. construir tramites
7. construir ficha de tramite
8. construir finanzas
9. construir ayudas

## 14. Decision tomada para continuar

Se sigue con:

- prototipo frontend primero
- UI compartida entre todas las areas
- datos mockeados
- estructura preparada para integrar PostgreSQL o Firestore mas adelante

## 15. Estado actual al 07-04-2026

### Cerrado hoy

- login obligatorio con Google usando Supabase Auth
- allowlist por Gmail para acceso real
- deploy productivo en `gestorapp.lat`
- dominio canonico unificado sin mezclar `www`
- persistencia real con Prisma + PostgreSQL en Supabase
- modulos conectados a base: dashboard, tramites, contactos, vehiculos, finanzas, ayudas, tareas y operaciones
- altas y ediciones reales en modulos principales
- archivado logico en contactos, tareas, vehiculos y ayudas
- detalle real de tramite, contacto, vehiculo y operacion
- buscador global y acciones rapidas reales
- relaciones reales entre tramites, vehiculos y operaciones
- validaciones de negocio en server actions
- proteccion basica contra cambios sin guardar
- mejora mobile de shell, dashboard, finanzas, tramites, contactos, operaciones, tareas y vehiculos
- login estabilizado con dominio canonico y flujo de callback consistente en Vercel/Supabase
- detalle de tramite con historial operativo real al cambiar estado, marcar requisitos, cargar movimientos y agregar notas
- ayudas mas integradas al flujo con centro de guias mas fuerte y acceso desde tramites y dashboard
- boton global `Nuevo` con accesos reales a altas frecuentes
- `finanzas` reforzado con:
  - lectura ejecutiva de ingresos, egresos y balance
  - balances por area de negocio
  - ranking de categorias de ingreso y egreso
  - indicadores de tramites sin cobro cargado, observados y pendientes documentales
  - panel de seguimiento de tramites activos sin ingreso vinculado
- dashboard con mejor lectura de observados, documentos pendientes y bloqueos operativos
- tramites con alertas operativas y sugerencias accionables

### Pendiente cercano

- revisar visualmente produccion desde telefono con datos reales
- rotar la password de base compartida en el chat
- reforzar finanzas con cuentas por cobrar / pagar mas explicitas
- sumar reportes comparativos simples por periodo o por area
- mejorar deteccion de duplicados en contactos
- seguir puliendo UX de carga rapida y lectura para usuario no tecnico
