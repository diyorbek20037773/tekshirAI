export default function LoadingSpinner({ text = 'Yuklanmoqda...' }: { text?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-400">{text}</p>
      </div>
    </div>
  );
}
