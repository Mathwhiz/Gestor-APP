export const summaries = [
  { title: "Ingresos hoy", value: "$ 480.000", detail: "Honorarios cobrados y una sena de agencia.", accent: "#1f4f5f" },
  { title: "Egresos hoy", value: "$ 126.000", detail: "Formularios, combustible y comision de tercero.", accent: "#b57628" },
  { title: "Tramites urgentes", value: "6", detail: "Dos observados y cuatro con documentacion faltante.", accent: "#ad5f47" },
  { title: "Cobros pendientes", value: "$ 1.280.000", detail: "Distribuidos entre gestoria y agencia.", accent: "#2b6f55" },
];

export const procedures = [
  { id: "transferencia-ranger", type: "Transferencia", client: "Carlos Fernandez", vehicle: "Ford Ranger 2019 - AE918KD", status: "Pendiente de documentacion", statusTone: "warning" as const, priority: "Urgente", jurisdiction: "La Pampa", targetDate: "08/04/2026" },
  { id: "duplicado-gol", type: "Duplicado de cedula", client: "Mariana Lopez", vehicle: "Volkswagen Gol 2016 - AC345TR", status: "Presentado", statusTone: "info" as const, priority: "Media", jurisdiction: "Nacional", targetDate: "10/04/2026" },
  { id: "denuncia-venta", type: "Denuncia de venta", client: "Agencia Ruta 5", vehicle: "Peugeot 208 2020 - AG552LM", status: "Terminado", statusTone: "success" as const, priority: "Alta", jurisdiction: "Buenos Aires", targetDate: "05/04/2026" },
  { id: "patentamiento-yaris", type: "Patentamiento", client: "Lucia Perez", vehicle: "Toyota Yaris 0km - sin dominio", status: "Observado", statusTone: "danger" as const, priority: "Urgente", jurisdiction: "La Pampa", targetDate: "07/04/2026" },
];

export const tasks = [
  { id: "task-1", title: "Pedir firma faltante por transferencia", related: "Transferencia - Carlos Fernandez", dueLabel: "Hoy - 10:30", priority: "Urgente", assignee: "Marcelo", tone: "danger" as const },
  { id: "task-2", title: "Llevar carpeta al Registro Santa Rosa 2", related: "Duplicado de cedula - Volkswagen Gol", dueLabel: "Hoy - 13:00", priority: "Alta", assignee: "Marcelo", tone: "warning" as const },
  { id: "task-3", title: "Revisar observacion de patentamiento", related: "Toyota Yaris 0km", dueLabel: "Manana - 09:15", priority: "Urgente", assignee: "Marcelo", tone: "danger" as const },
  { id: "task-4", title: "Cobrar honorarios atrasados", related: "Cliente recurrente", dueLabel: "Manana - 17:00", priority: "Media", assignee: "Administracion", tone: "info" as const },
];

export const movements = [
  { id: "mov-1", date: "06/04/2026", description: "Cobro honorarios transferencia Ranger", category: "Honorarios de tramites", area: "Gestoria", account: "Caja gestoria", amount: "+ $ 320.000" },
  { id: "mov-2", date: "06/04/2026", description: "Pago formularios y sellados", category: "Aranceles", area: "Gestoria", account: "Caja gestoria", amount: "- $ 42.000" },
  { id: "mov-3", date: "06/04/2026", description: "Combustible por recorrida a registro", category: "Viaticos", area: "General", account: "Caja general", amount: "- $ 18.000" },
  { id: "mov-4", date: "06/04/2026", description: "Comision pagada a tercero", category: "Comisiones pagadas", area: "Gestoria", account: "Caja gestoria", amount: "- $ 24.000" },
  { id: "mov-5", date: "05/04/2026", description: "Pago de alquiler oficina", category: "Alquiler", area: "General", account: "Banco", amount: "- $ 110.000" },
];

export const guides = [
  { id: "guide-1", title: "Transferencia", summary: "Checklist base, pasos de control y links utiles para no dejar firmas o verificaciones afuera.", scope: "Base", jurisdiction: "Nacional + notas La Pampa", lastUpdate: "Actualizada 04/04", highlights: ["Verificar titularidad, deuda y documentacion antes de mover carpeta.", "Confirmar si hay requisito adicional del registro o jurisdiccion."] },
  { id: "guide-2", title: "Duplicado de cedula", summary: "Guia corta para documentacion requerida, observaciones comunes y validaciones previas.", scope: "Base", jurisdiction: "Nacional", lastUpdate: "Actualizada 01/04", highlights: ["Controlar legitimacion del solicitante y constancia de titularidad.", "Registrar siempre si la gestion depende de presencia o autorizacion."] },
  { id: "guide-3", title: "Denuncia de venta", summary: "Resumen de pasos, papeles y criterio interno para evitar rechazos o entregas incompletas.", scope: "Interna", jurisdiction: "Nacional + provincial", lastUpdate: "Actualizada 03/04", highlights: ["Validar fecha exacta de la venta y documentacion respaldatoria.", "Dejar trazabilidad del resultado y constancia entregada al cliente."] },
];

export const contacts = [
  { id: "contact-1", name: "Carlos Fernandez", role: "Cliente particular", document: "DNI 24.556.120", phone: "+54 2954 441122", location: "Santa Rosa, La Pampa", status: "Activo" },
  { id: "contact-2", name: "Mariana Lopez", role: "Clienta recurrente", document: "DNI 28.445.871", phone: "+54 2954 223344", location: "Toay, La Pampa", status: "Activa" },
  { id: "contact-3", name: "Agencia Ruta 5", role: "Tercero derivador", document: "CUIT 30-71234567-8", phone: "+54 11 4444 8899", location: "CABA", status: "Activo" },
  { id: "contact-4", name: "Registro Seccional Santa Rosa 2", role: "Registro", document: "Organismo", phone: "+54 2954 402200", location: "Santa Rosa, La Pampa", status: "Activo" },
  { id: "contact-5", name: "Estudio Contable Suarez", role: "Proveedor", document: "CUIT 30-70999888-1", phone: "+54 2954 554433", location: "General Pico, La Pampa", status: "Activo" },
];

export const vehicles = [
  { id: "vehicle-1", plate: "AE918KD", name: "Ford Ranger XLS 2019", owner: "Carlos Fernandez", area: "Gestoria", status: "En tramite", tone: "warning" as const, note: "Transferencia con documentacion faltante." },
  { id: "vehicle-2", plate: "AG552LM", name: "Toyota Corolla XEI 2021", owner: "Agencia", area: "Agencia", status: "En stock", tone: "info" as const, note: "Unidad lista para publicar y mostrar." },
  { id: "vehicle-3", plate: "AC345TR", name: "Volkswagen Gol Trend 2016", owner: "Mariana Lopez", area: "Gestoria", status: "Documentacion incompleta", tone: "danger" as const, note: "Falta autorizacion complementaria." },
];

export const operations = [
  { id: "op-1", type: "Venta", vehicle: "Toyota Corolla XEI 2021 - AG552LM", buyer: "Martin Sosa", seller: "Agencia", date: "06/04/2026", agreedPrice: "$ 18.900.000", realCost: "$ 17.250.000", commission: "$ 0", margin: "$ 1.650.000", status: "Abierta", tone: "info" as const, note: "Unidad publicada, con dos visitas agendadas." },
  { id: "op-2", type: "Consignacion", vehicle: "Peugeot 208 2020 - AG552LM", buyer: "Sin comprador", seller: "Agencia Ruta 5", date: "05/04/2026", agreedPrice: "$ 14.200.000", realCost: "$ 13.500.000", commission: "$ 700.000", margin: "$ 700.000", status: "Reservada", tone: "warning" as const, note: "Operacion con reserva tomada, pendiente de cierre." },
  { id: "op-3", type: "Compra", vehicle: "Ford Ranger XLS 2019 - AE918KD", buyer: "Agencia", seller: "Carlos Fernandez", date: "03/04/2026", agreedPrice: "$ 23.500.000", realCost: "$ 22.800.000", commission: "$ 0", margin: "$ 700.000", status: "Cerrada", tone: "success" as const, note: "Ingreso a stock con transferencia ya encaminada." },
];

export type ProcedureDetail = {
  id: string;
  title: string;
  client: string;
  vehicle: string;
  registry: string;
  summary: { label: string; value: string; tone?: "success" | "warning" | "danger" | "neutral" | "info" }[];
  requirements: { label: string; note: string; done: boolean }[];
  timeline: { title: string; description: string; date: string }[];
  movements: { label: string; meta: string; amount: string }[];
  guide: { title: string; summary: string; steps: string[]; links: { label: string; href: string }[] };
  notes: string[];
  alerts?: { title: string; detail: string; tone: "success" | "warning" | "danger" | "neutral" | "info" }[];
  templateName?: string;
};

export const procedureDetails: Record<string, ProcedureDetail> = {
  "transferencia-ranger": {
    id: "transferencia-ranger",
    title: "Transferencia - Ford Ranger 2019",
    client: "Carlos Fernandez",
    vehicle: "AE918KD",
    registry: "Registro Santa Rosa 2",
    summary: [
      { label: "Estado", value: "Pendiente de documentacion", tone: "warning" },
      { label: "Prioridad", value: "Urgente", tone: "danger" },
      { label: "Jurisdiccion", value: "La Pampa" },
      { label: "Honorarios", value: "$ 320.000" },
    ],
    requirements: [
      { label: "Titulo del automotor", note: "Recibido y validado.", done: true },
      { label: "Firma certificada del vendedor", note: "Falta coordinar para hoy a la tarde.", done: false },
      { label: "Libre deuda / validacion previa", note: "Chequeado parcialmente, falta confirmar cierre.", done: false },
      { label: "Verificacion policial", note: "Realizada y archivada.", done: true },
    ],
    timeline: [
      { title: "Ingreso del tramite", description: "Se cargo cliente, vehiculo y checklist base.", date: "04/04/2026 - 11:20" },
      { title: "Revision documental", description: "Se detecto firma faltante del vendedor.", date: "05/04/2026 - 09:10" },
      { title: "Recordatorio al cliente", description: "Se aviso para coordinar firma.", date: "06/04/2026 - 08:45" },
    ],
    movements: [
      { label: "Cobro inicial", meta: "Honorarios de tramite - Caja gestoria", amount: "+ $ 320.000" },
      { label: "Formularios", meta: "Aranceles - Caja gestoria", amount: "- $ 42.000" },
    ],
    guide: {
      title: "Guia base de transferencia",
      summary: "Controlar primero documentacion, firmas, verificacion y restricciones antes de mover carpeta. Si la jurisdiccion agrega requisitos, dejarlos asentados en notas.",
      steps: [
        "Validar titularidad, dominio y situacion del vehiculo.",
        "Completar checklist de documentos y marcar faltantes.",
        "Confirmar si el registro o la provincia tienen una observacion especial.",
        "Registrar gastos y cobros desde el inicio para no perder caja real.",
      ],
      links: [
        { label: "Consulta interna de requisitos", href: "interna://guias/transferencia" },
        { label: "Enlace util del organismo", href: "https://www.argentina.gob.ar" },
      ],
    },
    notes: [
      "Separar en notas lo que es requisito nacional de lo que surge por practica local en La Pampa.",
      "No cerrar el tramite como terminado hasta tener trazabilidad de entrega al cliente.",
    ],
    alerts: [
      { title: "2 requisitos pendientes", detail: "Todavia falta documentacion para cerrar el expediente.", tone: "warning" },
      { title: "Sin cobro adicional", detail: "Solo esta cargado el cobro inicial del tramite.", tone: "info" },
    ],
    templateName: "Transferencia",
  },
};
