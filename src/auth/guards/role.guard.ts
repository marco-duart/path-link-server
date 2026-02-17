import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleNames, getLevelByName } from '../../enums/role.enum';
import { ROLES_KEY } from '../../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleNames[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const requiredLevels = requiredRoles.map((role) => getLevelByName(role));

    const minRequiredLevel = Math.min(...requiredLevels);

    return user.roleLevel >= minRequiredLevel;
  }
}
