/** A Firefox-like browser window; just the new-tab page for now. */
export function BrowserToolbar() {
  return (
    <div className="flex flex-1 items-center gap-3 pr-2">
      <div className="flex h-[28px] w-[180px] items-center rounded-[6px] bg-white px-3 text-[12px] shadow-sm">New Tab</div>
      <div className="flex h-[28px] flex-1 items-center rounded-[6px] bg-black/5 px-3 text-[12px] text-black/40">
        Search or enter address
      </div>
    </div>
  );
}

export function Browser() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-[#f9f9fb]">
      <p className="font-display text-[34px] tracking-[-0.05em]">shubham’s space</p>
      <div className="h-[44px] w-[60%] rounded-[10px] bg-white px-4 text-[14px] leading-[44px] text-black/40 shadow-[0_1px_6px_rgba(0,0,0,0.12)]">
        Search the web
      </div>
    </div>
  );
}
