declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEFAULT_REGION: string;
      DEFAULT_CURRENCY: string;
      PROJECT_ID: string; // PlanFix Default Project Id

      //    Admin Default Settings
      ADMIN_PASSWORD: string;
      ADMIN_EMAIL: string;

      // Only for KZ Region (EuroAsian Bank integration)
      EAB_ID: string;
      EAB_SECRET: string;

      // Email setup
      EMAIL_PASS: string;
      EMAIL_NAME: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;

      // Plan Fix Setup
      PF_TASK_ASSIGNER: number;
      PF_TASK_TEMPLATE: number;
      PLAN_FIX_TYPE: string;
      PLAN_FIX_API_TOKEN: string;
      PLAN_FIX_TOKEN_EXPIRES_IN: number;
    }
  }
}

export {};
