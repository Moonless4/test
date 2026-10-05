import clsx from 'clsx'
import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={clsx('mx-auto w-full max-w-shell px-5 sm:px-8 lg:px-10', className)}>
      {children}
    </div>
  )
}
