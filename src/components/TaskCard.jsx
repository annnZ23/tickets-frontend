export default function TaskCard({ tarea }) {
  return (
    <div className="px-4 py-3.5 border-b border-gray-100 last:border-b-0">
      <h4 className="text-[13px] font-bold text-slate-800 mb-1">{tarea.title}</h4>
      <p className="text-[11.5px] text-slate-500 mb-0.5">
        Asignado a: <span className="font-semibold text-slate-700">{tarea.assignedTo}</span>
      </p>
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5 mb-2">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {tarea.email}
      </p>
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f58220] text-white">
          {tarea.priority}
        </span>
        <span className="text-[11px] text-gray-400">Vence: {tarea.deadline}</span>
      </div>
    </div>
  );
}
