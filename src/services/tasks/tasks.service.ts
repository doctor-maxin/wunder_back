import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PlanFixService } from '../../integrations/planfix/planfix.service';
import { CustomerCandidateRepository } from '../../domains/users/repositories/customer-candidate.repository';
import { SettingsRepository } from '../../domains/settings/repositories/settings.repository';
import { CustomerRepository } from '../../domains/users/repositories/customer.repository';
import { AccountRepository } from '../../domains/accounts/account.repository';
import {
  ON_ACCOUNT_CREATE,
  ON_CUSTOMER_CANDIDATE_CREATE,
} from '../../common/events/events';
import { OnEvent } from '@nestjs/event-emitter';
import { IAccount } from '../../common/interfaces/account.interface';
import {
  ICustomer,
  ICustomerCandidate,
} from '../../common/interfaces/user.interface';
import { TaskType } from '../../common/types/taskType.enum';
import { CreateWaitingTaskDto } from './dto/create-waiting-task.dto';
import moment from 'moment';
import { ITask } from '../../common/interfaces/task.interface';
import { WrapperType } from '../../common/types/wrapper';
import { WaitingTaskRepository } from './repositories/waiting-task.repository';
import { TaskRepository } from './repositories/tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    @Inject(forwardRef(() => PlanFixService))
    private readonly planFixService: WrapperType<PlanFixService>,
    private readonly customerCandidateRepository: CustomerCandidateRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly accountRepository: AccountRepository,
    private readonly waitingTaskRepository: WaitingTaskRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  @OnEvent(ON_ACCOUNT_CREATE)
  public async createAccountTask(account: IAccount): Promise<void> {
    const globalSettings = await this.settingsRepository.globalSettings();
    const customer = await this.customerRepository.findById<ICustomer>(
      account.customerId,
    );
    const pfTaskId = await this.planFixService.createAccountTask(
      customer,
      account,
      globalSettings.planFixManagerId,
      globalSettings.projectId,
    );
    if (pfTaskId) {
      await this.taskRepository.appendNewTask({
        id: pfTaskId,
        type: TaskType.NEW_ACCOUNT,
        customerId: account.customerId,
        managerId: globalSettings.planFixManagerId,
      });
      await this.accountRepository.bindTaskId(account.id, pfTaskId);
    }
  }

  public async createAccountTopUpTask(
    customerId: number,
    taskId: number,
    invoiceId: number,
  ): Promise<void> {
    const globalSettings = await this.settingsRepository.globalSettings();

    await this.taskRepository.appendNewTask({
      id: taskId,
      type: TaskType.TOP_UP_ACCOUNTS,
      customerId: customerId,
      managerId: globalSettings.planFixManagerId,
      invoiceId,
    });
  }

  public async createOneAccountTopUpTask(
    parentTask: ITask,
    customerId: number,
    taskId: number,
    invoiceId: number,
    accountId: number,
  ): Promise<void> {
    await this.taskRepository.appendNewTask({
      id: taskId,
      type: TaskType.ONE_ACCOUNT_TOP_UP,
      customerId,
      managerId: parentTask.managerId,
      invoiceId,
      accountId,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public createTransferTask(): void {}

  @OnEvent(ON_CUSTOMER_CANDIDATE_CREATE)
  public async signUpTask(
    customer: ICustomerCandidate,
    managerId: string,
  ): Promise<void> {
    const pfTaskId = await this.planFixService.createPreSignUpTask(customer);
    if (pfTaskId) {
      await this.taskRepository.appendNewTask({
        id: pfTaskId,
        type: TaskType.CUSTOMER_CANDIDATE,
        customerCandidateId: customer.id,
        managerId,
      });

      await this.customerCandidateRepository.bindTaskId(customer.id, pfTaskId);
    }
  }

  public async signUpCompleteTask(
    customer: ICustomer,
    managerId: string,
    projectId: number,
  ): Promise<void> {
    const pfTaskId = await this.planFixService.createCompleteSignUpTask(
      customer,
      managerId,
      projectId,
    );
    await this.taskRepository.appendNewTask({
      id: pfTaskId,
      type: TaskType.NEW_CUSTOMER,
      customerId: customer.id,
      managerId: managerId,
    });
  }

  public async createCustomerCounterPartyTask(
    customer: ICustomer,
    managerId: string,
    projectId: number,
  ): Promise<void> {
    const pfTaskId = await this.planFixService.createCounterPartyTask(
      customer,
      managerId,
      projectId,
    );

    await this.taskRepository.appendNewTask({
      id: pfTaskId,
      type: TaskType.COUNTERPARTY_ID,
      customerId: customer.id,
      managerId: managerId,
    });
  }

  public async createInvoiceWaitingTask(
    data: CreateWaitingTaskDto,
  ): Promise<void> {
    const waitingExpireDate = moment()
      .add(data.paymentWaitingHours, 'hours')
      .toDate();

    const task = await this.waitingTaskRepository.createWaitingTask({
      id: data.id,
      customerId: data.customerId,
      type: TaskType.PAYMENT_WAITING,
      invoiceId: data.invoiceId,
      managerId: data.managerId,
      parentId: data.parentId,
      expireDate: waitingExpireDate,
    });
    console.log('Local Waiting Task ', task);
  }
}
