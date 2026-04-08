export type ProcedureTemplate = {
  type: string;
  summary: string;
  checklist: { label: string; note: string }[];
  helpSteps: string[];
  defaultJurisdiction: string;
  defaultPriority: string;
};

const procedureTemplates: Record<string, ProcedureTemplate> = {
  Transferencia: {
    type: "Transferencia",
    summary: "Controlar dominio, titularidad, firmas certificadas, libre deuda y validacion previa antes de presentar.",
    checklist: [
      { label: "Titulo del automotor", note: "Confirmar que este completo y coincida con el dominio." },
      { label: "Firma certificada del vendedor", note: "No mover carpeta sin firma o poder valido." },
      { label: "Libre deuda / validacion previa", note: "Revisar deuda, inhibiciones y observaciones del registro." },
      { label: "Verificacion policial", note: "Corroborar si aplica segun unidad y jurisdiccion." },
    ],
    helpSteps: [
      "Validar titularidad y datos base del vehiculo.",
      "Cerrar checklist documental antes de presentar.",
      "Cargar honorarios y gastos desde el primer contacto.",
    ],
    defaultJurisdiction: "La Pampa",
    defaultPriority: "Media",
  },
  Patentamiento: {
    type: "Patentamiento",
    summary: "Ordenar factura, identidad del titular, formularios y validaciones previas para evitar observaciones del alta inicial.",
    checklist: [
      { label: "Factura o documento de origen", note: "Corroborar origen y datos fiscales completos." },
      { label: "Identidad del titular", note: "Confirmar DNI o CUIT segun corresponda." },
      { label: "Formulario inicial completo", note: "Revisar que no falten firmas ni datos de contacto." },
      { label: "Pago y sellados", note: "Dejar trazabilidad de aranceles y comprobantes." },
    ],
    helpSteps: [
      "Chequear datos del titular antes de emitir formularios.",
      "Confirmar si hay requisito provincial adicional.",
      "Guardar referencia del concesionario o proveedor.",
    ],
    defaultJurisdiction: "La Pampa",
    defaultPriority: "Alta",
  },
  "Duplicado de cedula": {
    type: "Duplicado de cedula",
    summary: "Verificar legitimacion, denuncia o motivo del duplicado y documentacion minima antes de cargar el expediente.",
    checklist: [
      { label: "Solicitud del titular o autorizado", note: "Confirmar legitimacion para pedir el duplicado." },
      { label: "Documento de identidad", note: "Validar identidad vigente del solicitante." },
      { label: "Cedula o denuncia previa", note: "Asentar si hay perdida, robo o deterioro." },
      { label: "Pago del arancel", note: "Cargar el gasto y dejar nota de caja." },
    ],
    helpSteps: [
      "Confirmar si el cliente retira en persona o con autorizacion.",
      "Dejar nota del motivo para futuras consultas.",
      "Avisar fecha probable de entrega desde el alta.",
    ],
    defaultJurisdiction: "Nacional",
    defaultPriority: "Media",
  },
  "Denuncia de venta": {
    type: "Denuncia de venta",
    summary: "Registrar fecha de venta, identidad del transmitente y respaldo de la operacion para evitar rechazos o reclamos posteriores.",
    checklist: [
      { label: "Datos del vendedor", note: "Confirmar titularidad y documento respaldatorio." },
      { label: "Fecha y datos de la venta", note: "Dejar asentado dia, comprador y unidad." },
      { label: "Formulario y firma", note: "Revisar firma y presentacion correcta." },
      { label: "Constancia para entregar", note: "Preparar respaldo para el cliente." },
    ],
    helpSteps: [
      "Registrar fecha exacta de la venta desde el inicio.",
      "Vincular comprador si ya esta cargado.",
      "Dejar constancia entregada en notas o historial.",
    ],
    defaultJurisdiction: "Nacional",
    defaultPriority: "Alta",
  },
};

export function listProcedureTemplates() {
  return Object.values(procedureTemplates);
}

export function getProcedureTemplate(type: string) {
  return procedureTemplates[type] ?? procedureTemplates.Transferencia;
}
