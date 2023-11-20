import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWaitingTaskDto } from '../dto/create-waiting-task.dto';
import { TaskType } from '../../../common/types/taskType.enum';
import { WaitingTaskEntity } from '../entity/waiting-task.entity';

@Injectable()
export class WaitingTaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async setStatus(id: number, isActive: boolean): Promise<void> {
    await this.prisma.paymentWaiting.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
    });
  }
  public async createWaitingTask(
    data: Omit<CreateWaitingTaskDto, 'paymentWaitingHours'> & {
      expireDate: Date;
      type: TaskType;
    },
  ): Promise<WaitingTaskEntity> {
    await this.prisma.task.create({
      data: {
        customerId: data.customerId,
        type: data.type,
        id: data.id,
        invoiceId: data.invoiceId,
        managerId: data.managerId,
        parentId: data.parentId,
      },
    });

    return this.prisma.paymentWaiting.create({
      data: {
        task: {
          connect: {
            id: data.id,
          },
        },
        isActive: true,
        expireDate: data.expireDate,
      },
      include: {
        task: true,
      },
    });
  }

  public async getActiveTasks(): Promise<WaitingTaskEntity[]> {
    return this.prisma.paymentWaiting.findMany({
      where: {
        isActive: true,
      },
      include: {
        task: true,
      },
    });
  }

  public async getExpiredActiveTasks(): Promise<WaitingTaskEntity[]> {
    return this.prisma.paymentWaiting.findMany({
      where: {
        isActive: true,
        expireDate: {
          lte: new Date(),
        },
      },
      include: {
        task: true,
      },
    });
  }
}
