export type DashboardFilter = 'all' | 'completed' | 'processing' | 'failed';

const filterLabels: Record<DashboardFilter, string> = {
  all: 'Toutes les analyses',
  completed: 'Terminées',
  processing: 'En cours',
  failed: 'Échecs',
};

export function FilterBar({ activeFilter, onChange }: { activeFilter: DashboardFilter; onChange: (filter: DashboardFilter) => void }) {
  return (
    <div className="filter-bar">
      {(Object.entries(filterLabels) as Array<[DashboardFilter, string]>).map(([filter, label]) => (
        <button
          key={filter}
          type="button"
          className={`filter-bar__btn ${activeFilter === filter ? 'is-active' : ''}`}
          aria-pressed={activeFilter === filter}
          onClick={() => onChange(filter)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
