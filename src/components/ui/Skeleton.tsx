export interface SkeletonProps {
  className?: string
  variant?: 'rect' | 'circle' | 'text'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className = '',
  variant = 'rect',
  width,
  height,
}: SkeletonProps) {
  const variantClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-[2px] h-3.5 my-1'
      : 'rounded-[4px]'

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      style={style}
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 ${variantClass} ${className}`}
      aria-hidden="true"
    />
  )
}
