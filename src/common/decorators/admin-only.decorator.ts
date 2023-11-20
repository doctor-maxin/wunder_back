import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

export const AdminOnly = createParamDecorator(
  (data: undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const role = request.user['role'];
    if (role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    return role;
  },
);
