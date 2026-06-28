/** ponytail: temporary page body until each feature milestone (F4–F12) fills it in. */
export function Placeholder({ title, milestone }: { title: string; milestone: string }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-7 py-[18px]">
        <h1 className="text-[21px] font-extrabold tracking-tight">{title}</h1>
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="text-[15px] font-bold">{title}</div>
          <div className="mt-1 text-[13px] text-muted-foreground">Coming in {milestone}</div>
        </div>
      </div>
    </div>
  )
}
