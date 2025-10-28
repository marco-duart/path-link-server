import { RoleHierarchy } from 'src/enums/role.enum';

export interface JwtPayload {
  name: string;
  email: string;
  user: number;
  roleName: keyof typeof RoleHierarchy;
  department: string;
  team: string;
}
