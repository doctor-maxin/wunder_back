import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashService {
  public async compare(plaintext: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hashed);
  }

  public async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
}
