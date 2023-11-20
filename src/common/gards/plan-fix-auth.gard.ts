import { AuthGuard } from '@nestjs/passport';

export class PlanFixAuthGard extends AuthGuard('jwt-plan-fix') {
  constructor() {
    super();
  }
}
