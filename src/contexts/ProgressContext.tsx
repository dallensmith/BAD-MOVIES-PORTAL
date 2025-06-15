import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ProgressStep, ProgressContextType } from '../types/progress';

export const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [steps, setStepsState] = useState<ProgressStep[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');

  const addStep = (step: Omit<ProgressStep, 'status'>) => {
    setStepsState(prev => [...prev, { ...step, status: 'pending' }]);
  };

  const updateStep = (id: string, updates: Partial<ProgressStep>) => {
    setStepsState(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const setSteps = (newSteps: ProgressStep[]) => {
    setStepsState(newSteps);
  };

  const showProgress = (operation: string) => {
    setCurrentOperation(operation);
    setIsVisible(true);
  };

  const hideProgress = () => {
    setIsVisible(false);
    // Don't clear steps immediately to allow user to see final state
  };

  const clearSteps = () => {
    setStepsState([]);
  };

  return (
    <ProgressContext.Provider
      value={{
        steps,
        isVisible,
        currentOperation,
        addStep,
        updateStep,
        setSteps,
        showProgress,
        hideProgress,
        clearSteps,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
