import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon, children }: PageHeaderProps) {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                {icon}
              </div>
            )}
            <div>
              <h1 className="font-serif text-2xl text-neutral-900 sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
            </div>
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
