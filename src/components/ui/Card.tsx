import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  interactive?: boolean
  highlight?: boolean
  className?: string
}

export function Card({
  children,
  interactive = false,
  highlight = false,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-[6px] border bg-white dark:bg-surface-dark-paper p-4 transition-all duration-150 ${
        highlight
          ? 'border-sky/50 bg-sky-tint/30 dark:bg-sky/5'
          : 'border-surface-border dark:border-surface-dark-border'
      } ${
        interactive
          ? 'hover:-translate-y-[1px] cursor-pointer hover:border-sky/40 dark:hover:border-sky/40'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
