export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-7 h-7 border-[2.5px] border-sky border-t-transparent rounded-full animate-spin" />
      <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-2.5 font-medium">
        {label}
      </p>
    </div>
  )
}
