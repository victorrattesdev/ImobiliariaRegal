import PropertyGrid from '../PropertyGrid';

export default function PropertyGridExample() {
  return (
    <div className="container mx-auto px-4">
      <PropertyGrid
        searchQuery=""
        activeTab="buy"
        onPropertyView={(id) => console.log('View property:', id)}
      />
    </div>
  );
}