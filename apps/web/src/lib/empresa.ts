/**
 * Datos legales del proveedor para las páginas legales y el pie de página.
 * Se completan cuando la dueña los entregue; mientras estén en null NO se muestran (no se inventan).
 */
export const EMPRESA: {
  razonSocial: string | null;
  ruc: string | null;
  domicilio: string | null;
  correo: string | null;
  horario: string | null;
} = {
  razonSocial: null,
  ruc: null,
  domicilio: null,
  correo: null,
  horario: null,
};

export function datosDeLaEmpresa(): { etiqueta: string; valor: string }[] {
  const filas: [string, string | null][] = [
    ["Razón social", EMPRESA.razonSocial],
    ["RUC", EMPRESA.ruc],
    ["Domicilio", EMPRESA.domicilio],
    ["Correo", EMPRESA.correo],
    ["Horario de atención", EMPRESA.horario],
  ];
  return filas.filter((f): f is [string, string] => Boolean(f[1])).map(([etiqueta, valor]) => ({ etiqueta, valor }));
}
