export const RoleHierarchy = {
  Auxiliar: 10,
  Assistente: 20,
  Analista: 30,
  Coordenador: 40,
  Gerente: 50,
  Admin: 99,
};

export const RoleNames = Object.keys(RoleHierarchy);

export function getLevelByName(roleName: string): number {
  return RoleHierarchy[roleName as keyof typeof RoleHierarchy] || 0;
}

export function getNameByLevel(level: number): string {
  const foundName = Object.entries(RoleHierarchy).find(
    ([, value]) => value === level,
  );
  return foundName ? foundName[0] : 'Desconhecido';
}
