import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(Roles, ctx.getHandler());

    if (!roles) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    return this.matchRoles(roles, req.user?.role);
  }

  matchRoles(roles: string[], userRole: Role) {
    let match = false;
    if (roles.indexOf(userRole) > -1) {
      match = true;
    }

    return match;
  }
}
