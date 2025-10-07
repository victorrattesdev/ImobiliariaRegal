import Header from '../Header';

export default function HeaderExample() {
  return (
    <Header 
      onSearch={(query) => console.log('Search:', query)}
      activeTab="buy"
      onTabChange={(tab) => console.log('Tab changed:', tab)}
    />
  );
}