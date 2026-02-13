export class AuthResponseDto {
  access_token: string;
  user: UserAuthDto;
}

export class UserAuthDto {
  id: number;
  name: string;
  email: string;
  roleName: string;
  roleLevel: number;
  department?: {
    id: string;
    name: string;
  };
  team?: {
    id: number;
    name: string;
  };
}
