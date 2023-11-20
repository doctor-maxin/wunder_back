import { PFFullTask } from './entity/pf-task.entity';

export type ICreatePFPayload = {
  title: string;
  managerId: string;
  description: string;
  counterparty?: number;
  projectId: number;
  parentTaskId?: number;
};

export type PFGetTaskResult = {
  result: string;
  task: PFFullTask;
};

export type CreatePFTaskResult = {
  result: string;
  id: number;
};

export type PFResponseError = {
  result: 'fail';
  code: number;
  error: string;
};

export type CreatePFTaskData = {
  id?: number;
  sourceObjectId?: string; // uuid
  sourceDataVersion?: string;
  name: string;
  description?: string;
  priority?: PFTaskPriority;
  status: PFBaseEntity<PFStatus>;
  processId?: number;
  resultChecking?: boolean;
  assigner?: PFPersonRequest;
  parent?: PFBaseEntity<number>;
  template?: PFBaseEntity<number>;
  project?: PFBaseEntity<number>;
  counterparty?: PFPersonRequest;
  dateTime?: PFTimePoint;
  startDateTime?: PFTimePoint;
  endDateTime?: PFTimePoint;
  delayedTillDate?: PFTimePoint;
  duration?: number;
  durationUnit?: 'Minute' | 'Hour' | 'Day' | 'Week' | 'Month';
  durationType?: 'CalendarDays' | 'WorkerDays';
  overdue?: boolean;
  closeToDeadLine?: boolean;
  notAcceptedInTime?: boolean;
  inFavorites?: boolean;
  isSummary?: boolean;
  isSequential?: boolean;
  assignees?: PFPeopleRequest;
  participants?: PFPeopleRequest;
  auditors?: PFPeopleRequest;
  isDeleted?: boolean;
  customFieldData?: PFCustomFieldValueRequest[];
};

export type PFCustomFieldValueRequest = {
  field: PFBaseEntity<number>;
  value: any;
};

export type PFTimePoint = {
  date: string; // (dd-MM-yyyy)
  time: string; // (HH:mm)
  datetime: string; // ISO (yyyy-MM-dd'T'HH:mm'Z')
};

export type PFPersonRequest = {
  id: string | number;
};

export enum PFTaskPriority {
  NotUrgent = 'NotUrgent',
  Urgent = 'Urgent',
}

export type PFBaseEntity<T> = {
  id: T;
};

export enum PFStatus {}

export type PFPeopleRequest = {
  users?: PFPersonRequest[];
  groups?: PFPersonRequest[];
};

export enum PlanFixStatus {
  Fail = 128,
  Completed = 3,
  Process = 2,
  Success = 6,
}
