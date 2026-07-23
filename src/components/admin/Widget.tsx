import React, { type ReactNode } from 'react';

interface WidgetProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const Widget: React.FC<WidgetProps> = ({ title, children, className = '', action }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-1 h-4 bg-primary rounded-full inline-block" />
        {title}
      </h3>
      {action}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);
