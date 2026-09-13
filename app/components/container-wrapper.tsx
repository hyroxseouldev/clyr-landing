import type { ReactNode } from 'react';

type ContainerWrapperProps = {
  children: ReactNode;
  className?: string;
};

export function ContainerWrapper({ children, className = '' }: ContainerWrapperProps) {
  return <div className={`container-wrapper ${className}`.trim()}>{children}</div>;
}
