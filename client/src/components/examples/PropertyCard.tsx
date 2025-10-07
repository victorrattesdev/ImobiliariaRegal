import PropertyCard from '../PropertyCard';
import heroImage from '@assets/generated_images/Luxury_house_hero_image_f495f766.png';

export default function PropertyCardExample() {
  return (
    <div className="max-w-sm">
      <PropertyCard
        id="1"
        title="Modern Luxury Villa"
        price="$1,250,000"
        location="Beverly Hills, CA"
        image={heroImage}
        beds={4}
        baths={3}
        sqft={2800}
        parking={2}
        type="sale"
        featured={true}
        onView={(id) => console.log('View property:', id)}
        onFavorite={(id) => console.log('Favorite property:', id)}
      />
    </div>
  );
}