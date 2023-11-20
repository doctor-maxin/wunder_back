export enum TaskType {
  'NEW_CUSTOMER' = 0, // Новый пользователь
  'TOP_UP_ACCOUNTS' = 1, // Пополнение счета предоплата
  'PAYMENT_WAITING' = 2, // Задача по ожиданию оплаты
  'CHECK_PAYMENT_NO_PAID' = 3, // Не оплачена задача
  'CHECK_PAYMENT_PAID' = 4, // Оплачена задача
  'COUNTERPARTY_ID' = 5, // Задача по проверке пользователя
  'NEW_ACCOUNT' = 6, // Новый акк
  'ONE_ACCOUNT_TOP_UP' = 7, // Пополнение пункта в платеже
  'BYE_CURRENCY_TASK' = 8, // покупка валюты
  'UPDATE_BILL' = 9, // обновление платежа
  'TRANSFER_ACCOUNTS', // перенос средств
  'BYE_TRANSFER_TASK', //, покупка валюты переноса средств
  'CUSTOMER_CANDIDATE', // вариант пользователя
  'EXPENSES_MOTHER',
  'PAYMENT_WAITING_EXPENSES',
  'PAYMENT_WAITING_EXPENSES_PAID',
  'PAYMENT_WAITING_EXPENSES_NO_PAID',
  POSTPAY_MOTHER,
  PAYMENT_WAITING_POSTPAY,
  PAYMENT_WAITING_POSTPAY_PAID,
  PAYMENT_WAITING_POSTPAY_NO_PAID,
}
