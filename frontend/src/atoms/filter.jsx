/**
 * @fileoverview Reusable Filter component
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Advanced filter component with chips to tables
 */
export function AdvancedStateFilter({ currentFilter, onFilterChange }) {
  const filters = [
    { value: 'Todos', label: 'Todos', color: 'gray' },
    { value: 'Pendiente', label: 'Pendiente', color: 'yellow' },
    { value: 'Rechazado', label: 'Rechazado', color: 'red' },
    { value: 'Aprobado', label: 'Aprobado', color: 'green' },
    { value: 'En Revisión', label: 'En Revisión', color: 'blue' },
  ];
  
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filtrar por estado:
      </label>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`
              px-3 py-2 
              rounded-full 
              text-sm 
              font-medium 
              transition-colors 
              duration-200
              border
              ${currentFilter === filter.value 
                ? 'ring-2 ring-offset-2 ring-brand/50 border-transparent' 
                : 'border-gray-200'
              }
              ${colorClasses[filter.color]}
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}