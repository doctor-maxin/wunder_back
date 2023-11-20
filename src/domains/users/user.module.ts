import { Module } from '@nestjs/common';
import { CustomerService } from './services/customer.service';
import { CustomersController } from './customers.controller';
import { PrismaService } from '../../prisma/prisma.service';
// import { TasksModule } from '../../services/tasks/tasks.module';
import { RepositoriesModule } from '../../repositories.module';
import { EmailModule } from '../../services/email/email.module';

@Module({
  imports: [RepositoriesModule, EmailModule],
  controllers: [CustomersController],
  providers: [PrismaService, CustomerService],
  exports: [CustomerService],
})
export class UserModule {}
