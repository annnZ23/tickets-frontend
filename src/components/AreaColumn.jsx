import TaskCard from "./TaskCard";

export default function AreaColumn({ nombre, icono, tareas }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#f58220] flex items-center justify-center text-xs">
          {icono}
        </div>
        <h3 className="text-[13.5px] font-bold text-slate-800">{nombre}</h3>
        <span className="ml-auto text-[11px] font-semibold text-slate-500">
          {tareas.length} tarea{tareas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {tareas.length === 0 ? (
        <p className="px-4 py-5 text-[12.5px] text-gray-400">Sin tareas asignadas en esta área.</p>
      ) : (
        <div>
          {tareas.map((tarea, idx) => (
            <TaskCard key={tarea.id || idx} tarea={tarea} />
          ))}
        </div>
      )}
    </div>
  );
}