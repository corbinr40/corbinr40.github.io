interface FilterBarProps {
  filters: { label: string; value: string }[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  title?: string;
}

export default function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  title,
}: FilterBarProps) {
  return (
    <div className="mb-4">
      {title && <h3 className="border-bottom py-3">{title}</h3>}
      <div className="d-flex flex-wrap gap-2" role="group" aria-label={title || 'Filters'}>
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`btn btn-primary${activeFilter === f.value ? " active" : ""}`}
            onClick={() => onFilterChange(f.value)}
            aria-pressed={activeFilter === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
