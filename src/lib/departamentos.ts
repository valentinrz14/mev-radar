export type Departamento = { code: string; name: string; deptoRegistrado: string };

// Catálogo completo de departamentos judiciales de MEV (código DtoJudElegido).
// `code` es lo único que usa la búsqueda; `deptoRegistrado` queda como referencia
// (el login usa el mevDeptoRegistrado del usuario, no el del departamento buscado).
// Ordenados alfabéticamente para el selector de la UI.
export const DEPARTAMENTOS: Departamento[] = [
  { code: '80', name: 'Avellaneda-Lanús', deptoRegistrado: '' },
  { code: '10', name: 'Azul', deptoRegistrado: 'AZ' },
  { code: '11', name: 'Bahía Blanca', deptoRegistrado: 'BB' },
  { code: '12', name: 'Dolores', deptoRegistrado: 'DO' },
  { code: '13', name: 'Junín', deptoRegistrado: 'JU' },
  { code: '14', name: 'La Matanza', deptoRegistrado: 'LM' },
  { code: '6', name: 'La Plata', deptoRegistrado: 'LP' },
  { code: '16', name: 'Lomas de Zamora', deptoRegistrado: 'LZ' },
  { code: '17', name: 'Mar del Plata', deptoRegistrado: 'MP' },
  { code: '18', name: 'Mercedes', deptoRegistrado: 'ME' },
  { code: '52', name: 'Moreno - Gral. Rodríguez', deptoRegistrado: 'MR' },
  { code: '19', name: 'Morón', deptoRegistrado: 'MO' },
  { code: '20', name: 'Necochea', deptoRegistrado: 'NE' },
  { code: '21', name: 'Olavarría', deptoRegistrado: 'OL' },
  { code: '22', name: 'Pergamino', deptoRegistrado: 'PE' },
  { code: '23', name: 'Quilmes', deptoRegistrado: 'QU' },
  { code: '24', name: 'San Isidro', deptoRegistrado: 'SI' },
  { code: '25', name: 'San Martín', deptoRegistrado: 'SM' },
  { code: '26', name: 'San Nicolás', deptoRegistrado: 'SN' },
  { code: '27', name: 'Tandil', deptoRegistrado: 'TN' },
  { code: '28', name: 'Trenque Lauquen', deptoRegistrado: 'TL' },
  { code: '49', name: 'Tres Arroyos', deptoRegistrado: 'TY' },
  { code: '29', name: 'Zárate/Campana', deptoRegistrado: 'ZC' },
];

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
