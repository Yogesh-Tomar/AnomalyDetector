import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <i className="fas fa-exclamation-triangle text-red-400"></i>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <div className="mt-1 text-sm text-red-700">{message}</div>
        {onRetry && (
          <div className="mt-3">
            <button
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ErrorMessage;