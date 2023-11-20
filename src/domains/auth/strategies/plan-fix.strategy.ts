import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanFixStrategy extends PassportStrategy(
  Strategy,
  'jwt-plan-fix',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.PLAN_FIX_TOKEN_SECRET,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
