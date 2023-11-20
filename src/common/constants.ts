import { SetMetadata } from '@nestjs/common';

export const ACCESS_TOKEN_EXPIRATION_TIME = '30m';
export const REFRESH_TOKEN_EXPIRATION_TIME = '7d';

export const JWT_SECRET = process.env.AT_SECRET || 'secret';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
