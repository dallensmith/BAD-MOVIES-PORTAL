interface ProgressStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
  total?: number;
  details?: string;
}

interface ProgressContextType {
  steps: ProgressStep[];
  isVisible: boolean;
  currentOperation: string;
  addStep: (step: Omit<ProgressStep, 'status'>) => void;
  updateStep: (id: string, updates: Partial<ProgressStep>) => void;
  setSteps: (steps: ProgressStep[]) => void;
  showProgress: (operation: string) => void;
  hideProgress: () => void;
  clearSteps: () => void;
}

export type { ProgressStep, ProgressContextType };
