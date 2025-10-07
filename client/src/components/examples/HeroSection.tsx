import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <HeroSection 
      onSearch={(query) => console.log('Hero search:', query)}
    />
  );
}