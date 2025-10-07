import FilterPanel from '../FilterPanel';

export default function FilterPanelExample() {
  return (
    <div className="max-w-md">
      <FilterPanel
        onFiltersChange={(filters) => console.log('Filters changed:', filters)}
        onReset={() => console.log('Filters reset')}
      />
    </div>
  );
}