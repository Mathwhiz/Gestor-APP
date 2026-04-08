# Plan Funcional y Tecnico - App Web para Gestoria y Agencia de Autos

## Estado Actual - Abril 2026

Ya quedaron implementados estos puntos en la app:

- archivado y reactivacion de contactos, tareas, guias, vehiculos, tramites, operaciones y movimientos
- filtros para separar activos de archivados en los modulos principales
- alertas operativas para vencimientos, observaciones, documentacion pendiente y tramites sin cobro
- plantillas de tramites para transferencia, patentamiento, duplicado de cedula y denuncia de venta
- reportes de caja por area de negocio y lectura de margen abierto en operaciones
- historial unificado en fichas de contacto y vehiculo para ver tramites y operaciones en una sola linea de tiempo
- descompresion visual de finanzas y operaciones para que se lean mas rapido
- prioridad diaria en dashboard con foco operativo
- agenda de tareas por hoy, manana y proximas
- reporte mensual liviano para caja y seguimiento
- busqueda global ampliada para tareas y ayudas
- atajos para vincular mejor operaciones con tramites

## Restriccion Actual de Documentos

El modulo de documentos sigue siendo importante, pero no conviene guardar archivos pesados dentro de una base free de 500 MB.

Decision practica actual:

- la base debe guardar metadatos y referencias
- los archivos reales conviene resolverlos despues con storage externo u otra estrategia liviana
- por ahora el foco sigue en orden operativo, caja, alertas e historial

Alternativas a evaluar mas adelante:

- Supabase Storage si se prioriza simplicidad dentro del stack actual
- Vercel Blob si se prioriza integracion simple con el deploy
- AWS S3 si se prioriza una solucion mas robusta y escalable

Conclusion actual:

- no implementarlo todavia
- retomarlo cuando ya este mas consolidado el flujo operativo principal

## Objetivo

Construir una app web para ayudar a un gestor nacional del automotor matriculado y a su agencia de autos a ordenar:

- tramites de clientes propios
- tramites realizados para terceros con los que trabaja
- clientes y contactos
- vehiculos
- ingresos y egresos
- gastos personales y laborales
- gastos de la agencia
- compra y venta de autos
- impuestos, alquiler y comisiones
- estado operativo diario

La idea es separar claramente el negocio de gestoria del negocio de agencia, pero compartiendo una base comun de contactos, vehiculos, movimientos y tareas.

## 1. Modulos principales

### 1. CRM / Contactos

Para registrar y centralizar personas y entidades con las que se trabaja.

Incluye:

- clientes
- compradores y vendedores
- terceros que derivan tramites
- proveedores
- registros seccionales
- escribanos
- aseguradoras
- contadores

### 2. Tramites

Para administrar el ciclo completo de cada tramite.

Incluye:

- alta de tramite
- estado actual
- documentacion faltante
- fechas clave
- observaciones
- pagos y cobros asociados
- comisiones
- historial de cambios

### 3. Vehiculos

Ficha unica de cada auto o moto vinculada a tramites y operaciones.

### 4. Agencia / Operaciones de compra-venta

Para manejar stock, compras, ventas, consignaciones, reservas, costos y margen.

### 5. Finanzas

Para ordenar todos los movimientos economicos del negocio y tambien distinguir gastos personales cuando haga falta.

### 6. Documentos

Para guardar y vincular archivos y comprobantes a cada tramite, vehiculo, cliente u operacion.

Nota de implementacion actual:

- no se recomienda adjuntar binarios pesados directamente en la base actual por el limite de almacenamiento
- la etapa correcta seria separar `metadatos en DB` y `archivos en storage`
- mientras tanto, este modulo queda planteado como siguiente fase y no como prioridad inmediata

### 7. Tareas y vencimientos

Para gestionar pendientes, recordatorios y fechas criticas.

### 8. Ayudas para tramites

Modulo de asistencia operativa para facilitar el trabajo diario del gestor.

Incluye:

- recordatorios por tipo de tramite
- guias paso a paso
- checklists de documentacion
- observaciones frecuentes
- links utiles
- modelos internos de procedimiento

### 9. Reportes

Para ver resultados, pendientes y control general del negocio.

## 2. Entidades y datos principales por modulo

### CRM / Contactos

#### Entidad: Contacto

Campos principales:

- tipo: cliente, proveedor, tercero, registro, comprador, vendedor, gestor asociado
- nombre o razon social
- DNI o CUIT
- telefono
- email
- direccion
- notas
- estado: activo o inactivo
- etiquetas

### Tramites

#### Entidad: Tramite

Campos principales:

- tipo de tramite
- cliente principal
- vehiculo asociado
- tercero derivador, si aplica
- registro seccional
- estado: pendiente, en preparacion, presentado, observado, terminado, entregado
- prioridad
- fecha de ingreso
- fecha estimada
- fecha real de cierre
- honorarios
- gastos asociados
- comision cobrada
- comision pagada
- observaciones
- archivado: si o no

#### Entidad: Historial de tramite

Campos principales:

- tramite
- fecha
- cambio de estado
- comentario
- responsable

Adicional implementado:

- eventos automaticos al crear tramite
- eventos por cambio de estado
- eventos por notas operativas
- eventos por movimientos vinculados

#### Entidad: Documento requerido

Campos principales:

- tramite
- tipo de documento
- recibido: si o no
- fecha de recepcion
- observacion

### Vehiculos

#### Entidad: Vehiculo

Campos principales:

- dominio
- marca
- modelo
- version
- anio
- tipo
- motor
- chasis o VIN
- color
- kilometraje
- titular actual
- valuacion estimada
- estado: en stock, vendido, consignado, en tramite, archivado
- archivado: si o no

### Agencia / Operaciones

#### Entidad: Operacion

Campos principales:

- tipo: compra, venta, consignacion, permuta, reserva
- vehiculo
- cliente comprador
- cliente vendedor
- fecha
- precio pactado
- costo real
- comision
- margen
- estado: abierta, reservada, cerrada, anulada
- archivado: si o no

#### Entidad: Gasto por vehiculo

Campos principales:

- vehiculo u operacion
- concepto: arreglo, lavado, flete, publicacion, comision, transferencia, gestoría
- importe
- fecha
- observaciones

### Finanzas

#### Entidad: Movimiento

Campos principales:

- tipo: ingreso, egreso, transferencia
- categoria
- subcategoria
- fecha
- importe
- metodo: efectivo, banco, billetera, cheque
- cuenta o caja
- relacionado con tramite, operacion, vehiculo o contacto
- comprobante
- notas
- archivado: si o no

#### Entidad: Cuenta

Tipos sugeridos:

- caja efectivo personal
- caja gestoría
- caja agencia
- cuenta bancaria
- billetera virtual

#### Entidad: Categoria

Categorias iniciales:

- personales
- laborales gestoría
- agencia
- impuestos
- alquiler
- servicios
- comisiones
- sueldos
- mantenimiento

### Documentos

#### Entidad: Archivo

Campos principales:

- tipo
- entidad asociada
- fecha
- nombre
- ubicacion o URL
- vencimiento opcional

### Tareas y vencimientos

#### Entidad: Tarea

Campos principales:

- titulo
- tipo
- prioridad
- fecha limite
- estado

Adicional implementado:

- archivo de tareas
- lectura rapida de agenda inmediata
- separacion entre pendientes, completadas y archivadas

## Mejoras Implementadas Sobre La Idea Inicial

### Alertas operativas

Ya existe una capa de alertas para detectar:

- tramites observados
- tramites con documentacion pendiente
- tramites vencidos o muy cercanos a la fecha objetivo
- tramites activos sin ingreso cargado
- operaciones abiertas o reservadas que piden seguimiento

### Flujo diario

Ya existe una capa de lectura rapida para el uso cotidiano:

- prioridad del dia en dashboard
- agenda inmediata cruzando tareas, tramites y operaciones
- tareas agrupadas por bloque de vencimiento
- atajos para crear o vincular entidades sin volver al listado general

### Plantillas de tramite

Ya existe logica para que ciertos tipos de tramite nazcan con estructura base:

- transferencia
- patentamiento
- duplicado de cedula
- denuncia de venta

Cada plantilla define:

- prioridad sugerida
- jurisdiccion sugerida
- checklist base
- resumen operativo
- ayuda inicial

### Reportes operativos

La app ya muestra reportes mas utiles para el negocio real:

- caja por gestoria
- caja por agencia
- caja general
- caja personal
- margen abierto de operaciones
- seguimiento de tramites sin cobro
- reporte mensual liviano de ingresos, egresos y neto

### Historial unificado

En fichas de contacto y vehiculo ya se puede leer en conjunto:

- tramites relacionados
- operaciones relacionadas
- orden cronologico basico para entender el caso completo
- relacionada con tramite, vehiculo, operacion o contacto

### Ayudas para tramites

#### Entidad: Guia de tramite

Campos principales:

- tipo de tramite
- titulo
- descripcion breve
- pasos sugeridos
- documentacion requerida
- errores frecuentes
- observaciones practicas
- links utiles
- version
- activa: si o no

#### Entidad: Recordatorio de tramite

Campos principales:

- tramite o tipo de tramite
- mensaje
- momento de activacion
- prioridad
- canal interno

#### Entidad: Recurso util

Campos principales:

- titulo
- tipo: link, archivo, nota, modelo
- URL o archivo
- categoria
- observaciones

## 3. Relaciones entre modulos

La app deberia girar alrededor de cuatro nucleos:

- contactos
- vehiculos
- tramites
- movimientos financieros

Relaciones clave:

- un contacto puede tener muchos tramites
- un contacto puede comprar o vender muchos vehiculos
- un vehiculo puede tener muchos tramites
- un vehiculo puede participar en varias operaciones a lo largo del tiempo
- un tramite puede tener muchos documentos, tareas, recordatorios y movimientos
- una operacion de agencia puede generar muchos movimientos y gastos por vehiculo
- un movimiento puede estar vinculado a un tramite, una operacion, un vehiculo o un contacto
- una tarea puede depender de un tramite, una operacion o un vencimiento general
- una guia de tramite puede vincularse a muchos tramites del mismo tipo

Regla de diseño importante:

- gestoria y agencia comparten contactos, vehiculos, documentos, tareas y finanzas
- pero los tableros y reportes deben separar claramente ambos negocios

## 4. Flujo diario de uso

Flujo operativo sugerido:

1. Abrir el dashboard principal.
2. Revisar tramites urgentes, tareas del dia, pagos y cobros pendientes.
3. Registrar nuevos clientes, nuevos tramites o nuevas operaciones de vehiculos.
4. Cargar o completar documentacion faltante.
5. Actualizar avances de tramites.
6. Registrar ingresos y egresos del dia.
7. Revisar stock, reservas, autos en venta o por entregar.
8. Consultar guias y recordatorios cuando se inicia o destraba un tramite.
9. Cerrar el dia validando caja, pendientes y proximos vencimientos.

## 5. Dashboard principal

El dashboard principal deberia ser operativo, no solo visual.

Bloques recomendados:

### Resumen del dia

- ingresos hoy
- egresos hoy
- saldo neto hoy
- cobros pendientes
- pagos pendientes

### Tramites

- pendientes
- en curso
- observados
- listos para entregar
- urgentes para hoy o manana

### Agencia

- autos en stock
- reservas activas
- ventas del mes
- margen estimado del mes

### Tareas

- tareas de hoy
- tareas atrasadas
- proximas 72 horas

### Alertas

- documentos faltantes
- impuestos o alquiler por vencer
- tramites sin movimiento
- autos con demasiados dias en stock

### Ayudas rapidas

- accesos a guias de tramites frecuentes
- checklist rapido por tipo de tramite
- links utiles a organismos o recursos internos

### Actividad reciente

- ultimos movimientos financieros
- ultimos cambios de estado
- ultimos cobros o pagos

## 6. MVP inicial

### Construir primero

1. Contactos
2. Vehiculos
3. Tramites
4. Movimientos financieros
5. Dashboard operativo basico
6. Tareas y recordatorios simples
7. Ayudas de tramites en formato simple

Con eso ya se resuelve:

- ordenar clientes
- saber en que estado esta cada tramite
- vincular autos con clientes y tramites
- registrar ingresos y egresos
- tener pendientes visibles
- consultar ayuda operativa sin salir del sistema

### Dejar para despues

1. Modulo completo de agencia con stock y rentabilidad avanzada
2. Gastos detallados por vehiculo
3. Documentos adjuntos avanzados
4. Reportes mensuales y comparativos
5. Multiusuario con roles mas finos
6. Automatizaciones
7. Integraciones externas

## 7. Estructura tecnica recomendada

La mejor opcion para arrancar simple y con margen de crecimiento es una app web monolitica moderna.

### Recomendacion general

- frontend y backend en un solo proyecto
- arquitectura modular por dominio
- base de datos relacional
- autenticacion basica desde el inicio

### Stack sugerido

#### Frontend

- Next.js o React con routing moderno
- interfaz enfocada en escritorio primero
- responsive para celular, pero pensada para uso administrativo
- tablas, filtros, formularios y estados como componentes base

#### Backend

- mismo proyecto full-stack
- API interna o acciones del servidor
- no usar microservicios al inicio

#### Base de datos

- PostgreSQL
- modelo relacional desde el comienzo

#### ORM

- Prisma o equivalente

#### Autenticacion

- usuario y contrasena
- roles simples: administrador, operador, solo lectura

#### Archivos

- almacenamiento de documentos en disco o bucket
- metadatos guardados en base de datos

### Principios tecnicos

- separar modulos por dominio y no solo por pantallas
- usar catalogos configurables de estados y categorias
- registrar historial de cambios en tramites y finanzas
- permitir relaciones opcionales entre entidades
- diseñar el sistema para crecer sin rehacer el modelo base

## 8. Modelo conceptual resumido

- Contactos: base de personas y entidades
- Vehiculos: base del activo fisico
- Tramites: actividad de gestoria
- Operaciones: actividad comercial de la agencia
- Movimientos: verdad financiera
- Tareas y recordatorios: seguimiento operativo
- Documentos: soporte documental
- Ayudas de tramites: soporte practico y conocimiento operativo

## 9. Nota sobre el modulo de ayudas para tramites

Este modulo vale la pena incluirlo desde el principio, aunque sea en una version simple, porque ataca un problema real del trabajo diario:

- recordar pasos
- no olvidar documentacion
- resolver dudas repetidas
- evitar perder tiempo buscando links o notas

Version inicial sugerida para este modulo:

- fichas por tipo de tramite
- checklist de documentacion
- notas practicas internas
- links utiles
- recordatorios manuales o semiautomaticos

Version futura:

- asistentes contextuales segun estado del tramite
- sugerencias automaticas
- plantillas editables
- base interna de conocimiento

## 10. Mapa de pantallas y navegacion

La navegacion principal deberia ser simple y consistente. No conviene esconder funciones importantes en demasiados niveles.

### Menu principal sugerido

- Dashboard
- Contactos
- Vehiculos
- Tramites
- Finanzas
- Agencia
- Tareas
- Ayudas
- Reportes
- Configuracion

### Pantallas del Dashboard

#### Dashboard principal

Debe mostrar:

- resumen financiero del dia
- tramites urgentes
- tareas pendientes
- autos en stock o reservados
- alertas operativas
- accesos rapidos a tramites frecuentes
- actividad reciente

#### Dashboard gestoría

Vista enfocada solo en:

- tramites por estado
- tramites observados
- tramites listos para entregar
- documentacion faltante
- cobros pendientes de tramites

#### Dashboard agencia

Vista enfocada solo en:

- stock
- reservas
- ventas del mes
- autos con mas dias publicados
- margen por operaciones
- gastos de agencia

### Pantallas de Contactos

#### Listado de contactos

Con:

- buscador
- filtros por tipo
- etiquetas
- acceso rapido a crear nuevo

#### Ficha de contacto

Debe agrupar:

- datos principales
- tramites relacionados
- vehiculos relacionados
- movimientos relacionados
- tareas
- notas

### Pantallas de Vehiculos

#### Listado de vehiculos

Con:

- buscador por dominio, marca, modelo, titular
- filtros por estado
- filtros por negocio: gestoria o agencia

#### Ficha de vehiculo

Debe incluir:

- datos tecnicos
- titular o cliente vinculado
- tramites relacionados
- operacion comercial relacionada
- gastos asociados
- documentos
- historial

### Pantallas de Tramites

#### Listado de tramites

Con:

- filtros por estado
- filtros por tipo de tramite
- filtros por responsable
- filtros por registro
- filtros por fecha

#### Crear tramite

Formulario con:

- cliente
- vehiculo
- tipo de tramite
- tercero derivador
- registro
- prioridad
- fecha estimada
- honorarios
- observaciones iniciales

#### Ficha de tramite

Debe tener pestañas o bloques:

- resumen
- estado actual
- checklist de documentacion
- historial
- gastos e ingresos
- tareas
- documentos
- ayuda contextual del tipo de tramite

### Pantallas de Finanzas

#### Libro de movimientos

Con:

- listado cronologico
- filtros por categoria
- filtros por cuenta
- filtros por modulo relacionado
- vista de ingresos y egresos

#### Nueva carga de movimiento

Debe permitir:

- registrar ingresos
- registrar egresos
- registrar transferencias
- vincular a tramite, operacion, vehiculo o contacto

#### Caja y cuentas

Vista de:

- saldos por caja o cuenta
- movimientos recientes
- resumen mensual

### Pantallas de Agencia

#### Stock y operaciones

Debe mostrar:

- autos en stock
- autos consignados
- reservas
- ventas cerradas

#### Ficha de operacion

Debe incluir:

- datos de compra o venta
- clientes involucrados
- costos
- comisiones
- margen estimado o real
- estado
- documentos relacionados

### Pantallas de Tareas

#### Agenda operativa

Con:

- hoy
- semana
- atrasadas
- proximas

#### Ficha de tarea

Debe poder vincularse a:

- tramite
- vehiculo
- operacion
- contacto

### Pantallas de Ayudas

#### Centro de ayudas

Debe permitir:

- buscar por tipo de tramite
- filtrar por categoria
- acceder a links utiles
- ver recordatorios frecuentes

#### Guia de tramite

Cada guia deberia mostrar:

- descripcion
- pasos
- documentacion requerida
- errores frecuentes
- links utiles
- notas internas

### Pantallas de Reportes

Version inicial:

- ingresos vs egresos
- tramites abiertos por estado
- cobros pendientes
- gastos por categoria
- stock y ventas

## 11. Navegacion recomendada dentro de la app

Logica sugerida:

- barra lateral fija para modulos principales
- buscador global arriba
- accesos rapidos para crear tramite, contacto, vehiculo o movimiento
- breadcrumbs simples en fichas
- acciones rapidas visibles sin entrar a menus escondidos

Principio operativo:

- lo frecuente debe requerir pocos clicks
- las pantallas de ficha deben concentrar toda la informacion relevante del objeto

## 12. Modelo de datos inicial del MVP

A nivel funcional, el MVP puede arrancar con estas tablas o colecciones principales.

### Tabla: users

Campos sugeridos:

- id
- nombre
- email
- password_hash
- rol
- activo
- created_at
- updated_at

### Tabla: contacts

Campos sugeridos:

- id
- type
- full_name
- company_name
- document_type
- document_number
- tax_id
- phone
- email
- address
- notes
- status
- created_at
- updated_at

### Tabla: vehicles

Campos sugeridos:

- id
- plate
- brand
- model
- version
- year
- vehicle_type
- engine_number
- vin
- color
- mileage
- current_owner_contact_id
- estimated_value
- business_area
- status
- notes
- created_at
- updated_at

### Tabla: procedures

Campos sugeridos:

- id
- procedure_type
- title
- contact_id
- vehicle_id
- referrer_contact_id
- registry_name
- status
- priority
- intake_date
- due_date
- closed_at
- fee_amount
- commission_in_amount
- commission_out_amount
- notes
- responsible_user_id
- created_at
- updated_at

### Tabla: procedure_history

Campos sugeridos:

- id
- procedure_id
- from_status
- to_status
- comment
- changed_by_user_id
- created_at

### Tabla: procedure_requirements

Campos sugeridos:

- id
- procedure_id
- requirement_name
- required
- received
- received_at
- notes
- created_at
- updated_at

### Tabla: tasks

Campos sugeridos:

- id
- title
- description
- related_type
- related_id
- priority
- status
- due_date
- assigned_user_id
- created_at
- updated_at

### Tabla: accounts

Campos sugeridos:

- id
- name
- account_type
- currency
- opening_balance
- active
- created_at
- updated_at

### Tabla: categories

Campos sugeridos:

- id
- module
- type
- name
- parent_id
- active
- created_at
- updated_at

### Tabla: financial_movements

Campos sugeridos:

- id
- movement_type
- movement_date
- amount
- account_id
- category_id
- related_type
- related_id
- payment_method
- description
- receipt_reference
- created_by_user_id
- created_at
- updated_at

### Tabla: operation_deals

Esta puede entrar en MVP ampliado o en fase siguiente.

Campos sugeridos:

- id
- deal_type
- vehicle_id
- buyer_contact_id
- seller_contact_id
- agreed_price
- actual_cost
- commission_amount
- estimated_margin
- status
- deal_date
- notes
- created_at
- updated_at

### Tabla: knowledge_guides

Campos sugeridos:

- id
- procedure_type
- title
- short_description
- steps_markdown
- required_docs_markdown
- common_issues_markdown
- useful_links_markdown
- notes_markdown
- active
- version
- created_at
- updated_at

### Tabla: useful_resources

Campos sugeridos:

- id
- title
- resource_type
- url
- file_path
- category
- notes
- active
- created_at
- updated_at

## 13. Reglas funcionales importantes del MVP

- un tramite puede existir sin vehiculo al inicio si todavia no se cargo toda la informacion
- un movimiento financiero puede no estar vinculado a ningun tramite si es un gasto general
- los contactos no deben duplicarse facilmente: hay que validar DNI, CUIT o combinacion de nombre y telefono
- los estados de tramites deben quedar historizados
- los gastos e ingresos de gestoria y agencia deben poder filtrarse por separado
- una ayuda de tramite debe ser reutilizable por todos los tramites del mismo tipo

## 14. Prioridad de construccion por etapas

### Etapa 1 - Base operativa

- autenticacion
- layout general
- contactos
- vehiculos
- tramites
- tareas
- dashboard basico

Objetivo:

tener control operativo de clientes, vehiculos y tramites.

### Etapa 2 - Orden financiero

- cuentas
- categorias
- movimientos financieros
- resumen diario y mensual
- filtros por negocio

Objetivo:

registrar caja, ingresos, egresos y pendientes de cobro o pago.

### Etapa 3 - Ayudas y productividad

- centro de ayudas
- fichas de guias por tramite
- links utiles
- recordatorios vinculados a tramites

Objetivo:

reducir errores, acelerar trabajo repetitivo y centralizar conocimiento practico.

### Etapa 4 - Agencia

- stock
- operaciones de compra y venta
- gastos por vehiculo
- margen por operacion

Objetivo:

ordenar la actividad comercial de la agencia sin mezclarla con la gestoria.

### Etapa 5 - Reportes y mejoras

- reportes comparativos
- documentos adjuntos
- roles mas finos
- automatizaciones

Objetivo:

mejorar control, trazabilidad y escalabilidad.

## 15. Recomendacion de producto antes de programar

Antes de escribir codigo conviene cerrar estas decisiones:

1. lista de tipos de tramites que realmente usa el negocio
2. lista de estados de tramite
3. categorias financieras iniciales
4. diferencia exacta entre gastos personales, laborales y de agencia
5. que datos minimos debe tener una ficha de vehiculo
6. que tramites necesitan guias desde el dia uno

Si estas seis definiciones quedan bien hechas, el desarrollo posterior sale mucho mas ordenado.

## 16. Blueprint funcional del MVP

Esta seccion baja el plan a definiciones mas concretas para que el desarrollo arranque con menos ambiguedad.

## 17. Tipos de tramites iniciales sugeridos

No hace falta arrancar con todos los tramites posibles. Conviene cubrir primero los mas frecuentes.

Lista inicial sugerida:

- transferencia
- informe de dominio
- informe historico
- denuncia de venta
- duplicado de titulo
- duplicado de cedula
- cedula para autorizado
- alta de patentamiento
- baja del automotor
- cambio de radicacion
- verificacion policial
- gestion de multas o deudas
- inscripcion inicial
- consulta o asesoramiento

Recomendacion funcional:

- cada tipo de tramite debe poder tener su propia guia
- cada tipo de tramite puede tener checklist de documentos distinto
- no conviene hardcodear estos tipos para siempre; deberian ser catalogos editables a futuro

## 18. Estados de tramite recomendados

El error comun es usar demasiados estados. Para el MVP conviene una secuencia simple y util.

Estados base:

- borrador
- pendiente de documentacion
- listo para presentar
- presentado
- observado
- en gestion externa
- terminado
- entregado
- cancelado

Significado operativo:

- `borrador`: se creo el tramite pero todavia falta informacion basica
- `pendiente de documentacion`: falta que el cliente entregue papeles o datos
- `listo para presentar`: ya esta listo para moverse
- `presentado`: ya fue ingresado o iniciado formalmente
- `observado`: surgio una observacion o bloqueo
- `en gestion externa`: depende de tercero, registro, perito, verificacion, etc.
- `terminado`: el tramite ya se resolvio
- `entregado`: documentacion o resultado ya fue entregado al cliente
- `cancelado`: no se sigue

Reglas recomendadas:

- cada cambio de estado debe crear historial
- deberia poder registrarse motivo de observacion o cancelacion
- `terminado` y `entregado` no son lo mismo y conviene separarlos

## 19. Categorias financieras iniciales

Para el MVP conviene trabajar con categorias cortas, claras y filtrables.

### Ingresos

- honorarios de tramites
- comisiones cobradas
- venta de vehiculo
- senas o reservas
- recupero de gastos
- otros ingresos

### Egresos de gestoria

- formularios
- aranceles
- viaticos
- combustible
- gestor externo o tercero
- comisiones pagadas
- correo o mensajeria
- fotocopias e impresiones
- otros gastos de tramites

### Egresos de agencia

- compra de vehiculo
- reparaciones
- limpieza y estetica
- publicaciones
- comisiones de venta
- flete o traslado
- transferencia asociada a venta
- otros gastos de vehiculo

### Egresos generales del negocio

- alquiler
- servicios
- sueldos
- impuestos
- contador
- sistema o herramientas
- mantenimiento

### Personales

- retiro personal
- gasto personal
- aporte personal al negocio

Regla importante:

- cada movimiento deberia tener un campo `business_area`: gestoria, agencia, general o personal
- eso simplifica mucho reportes y separacion contable operativa

## 20. Campos minimos por pantalla del MVP

## 21. Pantalla: Dashboard principal

Objetivo:

dar control rapido del estado operativo del dia.

Widgets minimos:

- ingresos del dia
- egresos del dia
- saldo neto
- tramites pendientes
- tramites observados
- tareas vencidas
- cobros pendientes
- pagos pendientes
- autos en stock
- accesos a ayudas frecuentes

Acciones:

- nuevo tramite
- nuevo contacto
- nuevo vehiculo
- nuevo movimiento
- ver tareas de hoy

## 22. Pantalla: Listado de tramites

Columnas minimas:

- numero o codigo interno
- tipo de tramite
- cliente
- vehiculo o dominio
- estado
- prioridad
- fecha de ingreso
- fecha objetivo
- responsable

Filtros minimos:

- estado
- tipo
- prioridad
- responsable
- rango de fechas

Acciones:

- crear tramite
- editar
- cambiar estado
- abrir ficha

## 23. Pantalla: Ficha de tramite

Bloques minimos:

- datos generales
- cliente
- vehiculo
- estado actual
- checklist de documentacion
- historial
- tareas vinculadas
- movimientos vinculados
- notas
- ayuda contextual

Acciones:

- editar datos
- cambiar estado
- agregar requisito
- marcar requisito recibido
- cargar tarea
- cargar gasto o ingreso
- abrir guia del tramite

## 24. Pantalla: Contactos

Listado:

- nombre
- tipo
- documento
- telefono
- localidad
- estado

Ficha:

- datos principales
- tramites
- vehiculos
- movimientos
- notas

Acciones:

- crear
- editar
- buscar duplicados
- abrir historial relacionado

## 25. Pantalla: Vehiculos

Listado:

- dominio
- marca y modelo
- anio
- titular actual
- estado
- negocio

Ficha:

- datos tecnicos
- cliente vinculado
- tramites relacionados
- operacion relacionada
- gastos relacionados
- notas

Acciones:

- crear
- editar
- vincular a tramite
- vincular a operacion

## 26. Pantalla: Finanzas

Listado de movimientos:

- fecha
- tipo
- categoria
- descripcion
- cuenta
- area de negocio
- importe
- relacionado con

Filtros:

- ingreso o egreso
- categoria
- cuenta
- area de negocio
- fecha

Acciones:

- nuevo ingreso
- nuevo egreso
- nueva transferencia
- editar movimiento

## 27. Pantalla: Tareas

Listado:

- titulo
- prioridad
- estado
- fecha limite
- vinculo relacionado
- responsable

Acciones:

- crear tarea
- marcar completada
- reprogramar
- abrir entidad relacionada

## 28. Pantalla: Ayudas

Listado de guias:

- tipo de tramite
- titulo
- descripcion corta
- ultima actualizacion

Ficha de guia:

- resumen
- pasos
- documentos
- errores frecuentes
- links utiles
- notas practicas

Acciones:

- buscar guia
- filtrar por tramite
- copiar link
- editar guia en etapa posterior

## 29. Definicion de acciones rapidas del sistema

El sistema deberia tener un boton visible de `Nuevo` con accesos a:

- nuevo tramite
- nuevo contacto
- nuevo vehiculo
- nuevo ingreso
- nuevo egreso
- nueva tarea

Tambien deberia existir una busqueda global para encontrar:

- contactos
- dominios
- tramites
- guias

## 30. Reglas de UX para el MVP

- evitar formularios demasiado largos en una sola pantalla
- dividir fichas complejas en bloques claros
- mostrar estado, prioridad y vencimiento de forma muy visible
- usar tablas filtrables como vista principal de trabajo
- reducir pasos para registrar un gasto o actualizar un estado
- permitir crear contacto o vehiculo desde un tramite sin salir del flujo

## 31. Reportes minimos del MVP

Conviene arrancar con pocos reportes pero que sirvan de verdad.

Reportes iniciales:

- ingresos y egresos por mes
- ingresos y egresos por area de negocio
- tramites por estado
- tramites observados o frenados
- cobros pendientes
- pagos pendientes
- autos en stock

## 32. Ayudas de tramites prioritarias para cargar primero

No hace falta documentar todos los tramites al inicio. Conviene arrancar por los que mas se repiten o generan mas errores.

Prioridad sugerida:

- transferencia
- informe de dominio
- duplicado de titulo
- duplicado de cedula
- alta de patentamiento
- denuncia de venta

Cada guia inicial deberia tener:

- cuando aplica
- documentos necesarios
- pasos basicos
- observaciones comunes
- links utiles

## 33. Definicion operativa del MVP listo para construir

El MVP queda bien definido si incluye estas capacidades:

- alta y gestion de contactos
- alta y gestion de vehiculos
- alta y seguimiento de tramites
- historial de estados
- checklist de documentacion por tramite
- tareas vinculadas
- registro de ingresos y egresos
- separacion por gestoria, agencia, general y personal
- dashboard operativo
- centro simple de ayudas para tramites

Con esto ya se resuelve el problema principal del negocio: tener control operativo y financiero basico sin depender de memoria, cuadernos o mensajes dispersos.

## 34. Contexto geografico y normativo

Base operativa del negocio:

- La Pampa, Argentina

Contexto de trabajo a contemplar:

- un gestor nacional del automotor puede intervenir en tramites de distintas jurisdicciones
- existen reglas, requisitos y particularidades nacionales
- tambien pueden existir diferencias practicas o documentales por provincia, municipio, registro o tipo de organismo

Implicancia de producto:

- la app no debe asumir una unica logica cerrada para todos los tramites
- los tipos de tramite, requisitos, guias, links y observaciones deben ser configurables
- conviene poder marcar jurisdiccion o alcance en tramites y ayudas

## 35. Recomendaciones de modelado para diferencias nacionales y provinciales

Para evitar rehacer el sistema despues, desde el inicio conviene preparar estas capacidades aunque el prototipo arranque simple.

### Campo de jurisdiccion

Agregar en tramites, guias y recursos utiles:

- jurisdiccion_nivel: nacional, provincial, municipal, registro
- jurisdiccion_nombre: por ejemplo La Pampa, Buenos Aires, CABA, organismo especifico o registro seccional

### Versionado de guias

Las ayudas de tramites deberian soportar:

- vigencia
- version
- notas de cambios
- marca de guia general o guia especifica por jurisdiccion

### Requisitos parametrizables

No conviene fijar una sola lista universal de documentos.

Lo correcto es permitir:

- checklist base por tipo de tramite
- requisitos extra por jurisdiccion
- notas particulares por registro u organismo

### Recursos utiles por contexto

Los links y notas deberian poder filtrarse por:

- tipo de tramite
- provincia
- organismo
- uso interno o publico

## 36. Prototipo de hoy: objetivo realista

Como objetivo para hoy, el prototipo no deberia intentar cubrir todo el sistema. Conviene priorizar una experiencia navegable y creible del flujo principal.

Objetivo del prototipo:

- mostrar como se veria y funcionaria la app
- validar estructura, navegacion y modelo operativo
- simular el trabajo diario de gestoría y agencia
- dejar una base clara para luego implementar en serio

## 37. Alcance recomendado para el prototipo de hoy

Pantallas prioritarias del prototipo:

1. Login simple
2. Dashboard principal
3. Listado de tramites
4. Ficha de tramite
5. Listado de contactos
6. Listado de vehiculos
7. Libro de movimientos financieros
8. Centro de ayudas

Con estas pantallas ya se puede contar bien la historia del producto.

## 38. Que debe poder mostrar el prototipo

Aunque no tenga backend real al principio, el prototipo deberia poder mostrar:

- tramites en distintos estados
- contacto cliente vinculado
- vehiculo vinculado
- checklist de documentacion
- movimientos de ingresos y egresos
- alertas y tareas
- ayuda contextual del tramite
- separacion entre gestoria, agencia y gastos generales

## 39. Historias de uso a simular en el prototipo

### Historia 1

Ingresa un cliente con un tramite de transferencia.

El sistema debe permitir ver:

- cliente
- vehiculo
- estado del tramite
- documentacion faltante
- gastos relacionados
- guia de ayuda del tramite

### Historia 2

Se registra un gasto de gestoria y luego se cobra al cliente.

El sistema debe permitir ver:

- egreso asociado
- ingreso asociado
- impacto en caja
- categoria financiera

### Historia 3

Se consulta rapidamente una guia para no olvidar requisitos o links utiles.

El sistema debe permitir ver:

- paso a paso
- checklist
- observaciones comunes
- links utiles
- si aplica en general o para una jurisdiccion particular

### Historia 4

Se revisa el dashboard a la manana para decidir prioridades del dia.

El sistema debe permitir ver:

- tramites urgentes
- tareas vencidas
- pagos pendientes
- cobros pendientes
- alertas operativas

## 40. Datos demo recomendados para el prototipo

Para que el prototipo se sienta real, conviene preparar un set chico pero creible de datos de ejemplo.

### Contactos demo

- cliente particular
- cliente recurrente
- tercero derivador
- proveedor
- registro seccional

### Vehiculos demo

- un auto con tramite de transferencia
- un auto en stock de agencia
- un vehiculo con documentacion incompleta

### Tramites demo

- transferencia en pendiente de documentacion
- duplicado de cedula presentado
- denuncia de venta terminada
- alta de patentamiento observada

### Movimientos demo

- cobro de honorarios
- gasto de formularios
- combustible
- comision pagada
- alquiler

### Guias demo

- transferencia
- duplicado de cedula
- denuncia de venta

## 41. Criterios de diseno del prototipo

El prototipo tiene que verse como una herramienta de trabajo real, no como una landing ni un panel generico.

Criterios:

- interfaz sobria y administrativa
- foco en tablas, estados, filtros y acciones rapidas
- densidad de informacion razonable
- legibilidad alta
- navegacion lateral clara
- uso fuerte de badges de estado, prioridad y vencimiento
- ayudas visibles sin interrumpir el flujo

## 42. Decisiones de producto que conviene congelar hoy

Para poder arrancar rapido, hoy conviene dejar fijas estas definiciones:

1. modulos del MVP
2. estados del tramite
3. categorias financieras iniciales
4. areas de negocio: gestoria, agencia, general, personal
5. pantallas del prototipo
6. estructura base de navegacion
7. forma de representar ayudas y jurisdicciones

## 43. Preparacion tecnica minima antes de programar

Antes de empezar a construir, conviene dejar decidido:

### Estructura de navegacion

- layout principal
- barra lateral
- encabezado
- acciones rapidas

### Sistema de diseno base

- paleta
- tipografias
- espaciado
- componentes base
- badges de estado
- tablas
- formularios

### Contratos funcionales

- nombres finales de modulos
- nombres finales de estados
- taxonomia financiera
- taxonomia de ayudas

### Datos demo

- set minimo inicial para poblar pantallas

## 44. Roadmap de hoy para llegar a un prototipo

Secuencia recomendada:

1. cerrar blueprint funcional
2. definir sitemap y navegacion final del prototipo
3. definir sistema visual base
4. definir datos demo
5. recien ahi empezar a construir interfaces

## 45. Riesgos de diseño a evitar desde el inicio

- mezclar gestoría y agencia en una sola vista sin filtros claros
- hacer una app financiera pura y perder seguimiento de tramites
- hacer una app de tramites pura y perder control economico
- meter demasiados campos en formularios iniciales
- dejar las ayudas como idea secundaria en vez de integrarlas al flujo
- asumir que todas las jurisdicciones usan exactamente la misma logica

## 46. Decision tecnica recomendada para el prototipo

Para el prototipo de hoy, la recomendacion concreta es:

- arrancar con frontend primero
- usar datos mockeados
- construir navegacion real
- dejar preparada la estructura para luego conectar backend y base de datos

Eso permite validar:

- si la app se entiende
- si el flujo sirve
- si faltan pantallas
- si el modelo operativo esta bien representado

## 47. Siguiente paso inmediato

El paso mas util ahora es definir el paquete exacto con el que se arranca el prototipo:

- sitemap final
- listado de componentes UI base
- datos demo iniciales
- lineamientos visuales

Con eso ya queda todo listo para pasar de plan a construccion.

## 48. Opcion tecnica: Firestore

Ademas de una base relacional tradicional, tambien se puede considerar Firestore si ayuda a acelerar el prototipo o simplificar despliegue e infraestructura.

### Cuando Firestore puede servir

- si se prioriza velocidad de arranque
- si el primer objetivo es un prototipo funcional
- si se quiere una integracion simple con autenticacion y hosting del ecosistema Firebase
- si el volumen inicial y la complejidad de consultas son manejables

### Ventajas

- arranque rapido
- backend inicial mas simple en ciertos flujos
- autenticacion y hosting faciles de combinar
- buena opcion para datos operativos y mockeados que luego evolucionan

### Riesgos o limites

- el dominio tiene muchas relaciones entre contactos, vehiculos, tramites, movimientos y operaciones
- reportes financieros y filtros complejos suelen ser mas naturales en SQL
- si el producto crece mucho en analitica, auditoria y consultas cruzadas, Firestore puede volverse menos comodo

### Decision recomendada

Para un prototipo:

- Firestore es una opcion valida

Para una version productiva de largo plazo:

- PostgreSQL sigue siendo la recomendacion mas solida

### Estrategia pragmatica

Si el objetivo es llegar rapido a una demo usable:

- se puede prototipar con frontend y datos mockeados
- luego decidir entre Firestore o PostgreSQL segun como se sienta el modelo

Si desde el principio se quiere persistencia simple:

- Firestore puede ser un buen primer paso

## 49. Estrategia para una UI consistente en toda la app

La UI no deberia resolverse pantalla por pantalla. Hay que definir un sistema compartido y despues reutilizarlo.

### Objetivo

Mantener una experiencia visual y funcional coherente entre:

- dashboard
- tramites
- contactos
- vehiculos
- finanzas
- ayudas
- agencia

### Principios

- un solo layout principal
- misma barra lateral y encabezado
- misma tipografia y paleta
- mismas reglas de espaciado
- mismas tablas, filtros y formularios
- mismos badges de estado y prioridad
- mismas tarjetas resumen

### Componentes UI base a compartir

- AppShell
- Sidebar
- Topbar
- PageHeader
- SummaryCard
- DataTable
- FilterBar
- StatusBadge
- PriorityBadge
- EmptyState
- DetailSection
- Timeline
- Checklist
- FormField
- QuickActions
- HelpPanel

### Regla de consistencia

Cada modulo puede tener contenido distinto, pero no deberia inventar un lenguaje visual distinto.

Lo correcto es:

- compartir estructura
- compartir componentes
- compartir patrones de interaccion
- variar solo lo que cambia por negocio o contexto

## 50. Skills y agents para este proyecto

En este entorno puedo trabajar con ambas cosas, pero no cumplen el mismo rol.

### Skills

Los `skills` son guias especializadas que sigo para ciertos tipos de tareas.

En esta sesion tengo disponible, entre otros, un skill de UI llamado:

- `ui-design`

Ese skill sirve para definir o explorar una UI con mejor criterio visual y mas coherencia de diseño.

### Agents

Los `agents` son subagentes que se pueden delegar para tareas concretas y acotadas.

Importante:

- solo uso `agents` si vos lo pedis explicitamente o si queres delegacion/subagentes

### Recomendacion para este proyecto

Para diseñar y construir una UI consistente, lo mas util es:

1. definir primero un sistema de diseño compartido
2. usar el skill `ui-design` cuando empecemos la parte visual
3. mantener componentes reutilizables para todas las pantallas

Si despues queres, tambien podemos trabajar con subagentes para dividir tareas, por ejemplo:

- uno enfocado en layout y design system
- otro en tablas y formularios
- otro en datos demo y wiring

Pero eso solo si vos queres ese modo de trabajo.

## 51. Decision recomendada para hoy

Si hoy queremos llegar a un prototipo bueno y consistente, la secuencia correcta es:

1. cerrar sitemap del prototipo
2. cerrar design system base compartido
3. definir datos mock
4. recien despues construir pantallas

Eso reduce mucho el riesgo de que cada parte de la app quede con una UI distinta.
