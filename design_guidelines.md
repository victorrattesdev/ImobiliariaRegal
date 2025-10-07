# Real Estate Website Design Guidelines

## Design Approach
**Reference-Based Approach** - Drawing inspiration from leading real estate platforms like Zillow, Realtor.com, and Airbnb's property listings. This experience-focused approach prioritizes visual appeal and intuitive property discovery.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Light mode: 220 15% 25% (sophisticated navy blue)
- Dark mode: 220 20% 85% (warm light gray)

**Accent Colors:**
- Success/Available: 142 76% 36% (forest green)
- Price highlights: 14 87% 54% (warm orange)

**Gradients:**
- Hero overlays: Deep blue to transparent black
- Property card hovers: Subtle white to light gray

### Typography
- **Headers:** Inter (600-700 weight)
- **Body:** Inter (400-500 weight)
- **Property prices:** Inter (600 weight, larger sizing)

### Layout System
**Spacing:** Consistent use of Tailwind units 2, 4, 6, 8, and 12
- Small elements: p-2, m-4
- Component spacing: gap-6, p-8
- Section spacing: py-12

### Component Library

**Property Cards:**
- Large property image with overlay details
- Price prominently displayed
- Key specs (beds/baths/sqft) as icons
- Favorite/save functionality
- Hover effects revealing additional info

**Search & Filters:**
- Prominent search bar with location autocomplete
- Expandable filter panel (price, type, features)
- Map/list view toggle
- Sort options dropdown

**Navigation:**
- Clean header with logo, main nav, and user account
- Sticky search bar on listing pages
- Breadcrumb navigation for property details

**Admin Panel:**
- Sidebar navigation for admin functions
- Property management table with quick actions
- Form-based property editor with image upload
- Analytics dashboard cards

**Property Details:**
- Image gallery with main hero image
- Detailed specs grid
- Interactive map
- Contact agent form
- Virtual tour integration placeholder

## Images
**Hero Image:** Large hero section featuring an aspirational property exterior or interior shot with gradient overlay for text readability.

**Property Images:** High-quality photos emphasizing natural light, spacious rooms, and key selling features. Each property card shows primary exterior or interior hero shot.

**Background Elements:** Subtle property-related patterns or textures for section breaks, city skyline silhouettes for location-based sections.

## Key Design Principles
1. **Visual Hierarchy:** Property prices and key features prominently displayed
2. **Trust Building:** Professional photography, clear pricing, verified badges
3. **Discovery Focus:** Easy filtering, visual property browsing, map integration
4. **Mobile-First:** Touch-friendly property cards and simplified mobile navigation
5. **Performance:** Optimized image loading with lazy loading for property galleries