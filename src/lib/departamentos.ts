export type Departamento = { code: string; name: string; deptoRegistrado: string };

// v1: solo Morón. En v2 se agregan el resto (mismo shape).
export const DEPARTAMENTOS: Departamento[] = [{ code: '19', name: 'Morón', deptoRegistrado: 'MO' }];

export function getDepartamento(code: string): Departamento | undefined {
  return DEPARTAMENTOS.find((d) => d.code === code);
}

// Opciones del campo "Creado en" (DeptoRegistrado) del login de MEV.
export type DeptoRegistrado = { value: string; label: string };
export const DEPTOS_REGISTRADOS: DeptoRegistrado[] = [
  { value: 'MO', label: 'Morón' },
  { value: 'MOF', label: 'Morón - Familia' },
  { value: 'AZ', label: 'Azul' },
  { value: 'BB', label: 'Bahía Blanca' },
  { value: 'DO', label: 'Dolores' },
  { value: 'JU', label: 'Junín' },
  { value: 'LM', label: 'La Matanza' },
  { value: 'LP', label: 'La Plata' },
  { value: 'LZ', label: 'Lomas de Zamora' },
  { value: 'MP', label: 'Mar del Plata' },
  { value: 'ME', label: 'Mercedes' },
  { value: 'MR', label: 'Moreno - Gral. Rodríguez' },
  { value: 'NE', label: 'Necochea' },
  { value: 'OL', label: 'Olavarría' },
  { value: 'PE', label: 'Pergamino' },
  { value: 'QU', label: 'Quilmes' },
  { value: 'SI', label: 'San Isidro' },
  { value: 'SM', label: 'San Martín' },
  { value: 'SN', label: 'San Nicolás' },
  { value: 'TN', label: 'Tandil' },
  { value: 'TL', label: 'Trenque Lauquen' },
  { value: 'TY', label: 'Tres Arroyos' },
  { value: 'ZC', label: 'Zárate/Campana' },
];

export function isDeptoRegistrado(value: string): boolean {
  return DEPTOS_REGISTRADOS.some((d) => d.value === value);
}
