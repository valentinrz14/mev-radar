export type Departamento = { code: string; name: string; deptoRegistrado: string };

// v1: solo Morón. En v2 se agregan el resto (mismo shape).
export const DEPARTAMENTOS: Departamento[] = [{ code: '19', name: 'Morón', deptoRegistrado: 'MO' }];

export function getDepartamento(code: string): Departamento | undefined {
  return DEPARTAMENTOS.find((d) => d.code === code);
}
