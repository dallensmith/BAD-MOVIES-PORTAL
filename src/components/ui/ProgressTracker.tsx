import React from 'react';
import { Check, Clock, AlertCircle, Loader } from 'lucide-react';
import { clsx } from 'clsx';

interface ProgressStepProps {
  title: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
  total?: number;
  details?: string;
}

const ProgressStep: React.FC<ProgressStepProps> = ({ 
  title, 
  status, 
  progress, 
  total, 
  details 
}) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProgressText = () => {
    if (progress !== undefined && total !== undefined) {
      return `${progress}/${total}`;
    }
    return '';
  };

  return (
    <div className={clsx(
      'flex items-center space-x-3 p-2 rounded-lg',
      status === 'active' && 'bg-blue-50',
      status === 'completed' && 'bg-green-50',
      status === 'error' && 'bg-red-50'
    )}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={clsx(
            'text-sm font-medium',
            status === 'completed' && 'text-green-700',
            status === 'active' && 'text-blue-700',
            status === 'error' && 'text-red-700',
            status === 'pending' && 'text-gray-500'
          )}>
            {title}
          </p>
          {getProgressText() && (
            <span className="text-xs text-gray-500 ml-2">
              {getProgressText()}
            </span>
          )}
        </div>
        {details && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {details}
          </p>
        )}
        {status === 'active' && progress !== undefined && total !== undefined && (
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProgressTrackerProps {
  title: string;
  steps: Array<{
    id: string;
    title: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    progress?: number;
    total?: number;
    details?: string;
  }>;
  isVisible: boolean;
  onClose?: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  title,
  steps,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const hasErrors = steps.some(step => step.status === 'error');
  const isComplete = completedSteps === totalSteps && !hasErrors;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            {completedSteps}/{totalSteps} completed
          </div>
        </div>
        
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {steps.map((step) => (
            <ProgressStep
              key={step.id}
              title={step.title}
              status={step.status}
              progress={step.progress}
              total={step.total}
              details={step.details}
            />
          ))}
        </div>

        {isComplete && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
