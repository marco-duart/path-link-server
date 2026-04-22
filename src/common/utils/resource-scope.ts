import { SelectQueryBuilder } from 'typeorm';

export function applyResourceScope(
  query: SelectQueryBuilder<any>,
  alias: string,
  userLevel: number,
  userDepartmentId?: string,
  userTeamId?: number,
) {
  void userLevel;

  if (!userDepartmentId || !userTeamId) {
    return query.andWhere('1 = 0');
  }

  return query.andWhere(
    `(${alias}.department_id = :deptId AND ${alias}.team_id = :teamId)`,
    { deptId: userDepartmentId, teamId: userTeamId },
  );
}

export function withUserOwnership<T extends Record<string, any>>(
  data: T,
  userDepartmentId?: string,
  userTeamId?: number,
): T & { department: any; team: any } {
  return {
    ...data,
    department: userDepartmentId ? ({ id: userDepartmentId } as any) : null,
    team: userTeamId ? ({ id: userTeamId } as any) : null,
  };
}