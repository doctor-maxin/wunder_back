import { AuthGuard } from '@nestjs/passport';

export class RtGard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
