interface Props {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: Props) {
  return (
    <header className="h-12 sm:h-14 border-b border-slate-200 bg-white flex items-center px-3 sm:px-6 shrink-0">
      <div>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 -mt-0.5">{subtitle}</p>}
      </div>
    </header>
  );
}
