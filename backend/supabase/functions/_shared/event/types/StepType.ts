export const StepType = {
  CHILD_CARE: 'CHILD_CARE',
  MEAL: 'MEAL',
  TRANSPORTATION: 'TRANSPORTATION'
} as const;

export type StepTypeType = typeof StepType[keyof typeof StepType];
