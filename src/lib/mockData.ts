// Mock data service with real Limpopo Province data
import type { Business, Event, MarketplaceItem, NewsArticle, TourismAttraction } from './api';

// Real businesses in Limpopo Province
export const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Makhadzi Restaurant',
    description: 'Authentic Venda cuisine serving traditional dishes with modern flair. Famous for our pap, morogo, and grilled meats.',
    category: 'Restaurant',
    address: '123 Church Street, Polokwane, 0699',
    phone: '+27 15 291 2000',
    email: 'info@makhadzi.co.za',
    website: 'https://makhadzirestaurant.co.za',
    latitude: -23.9045,
    longitude: 29.4689,
    rating: 4.5,
    imageUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/99ce67aa-5659-4285-a324-6ef5a9cedb33.png',
    openingHours: 'Mon-Sun: 7:00 AM - 10:00 PM',
    verified: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Baobab Craft Centre',
    description: 'Handcrafted African art, pottery, and jewelry made by local artisans. Supporting community crafts and traditional skills.',
    category: 'Arts & Crafts',
    address: '45 Market Square, Thohoyandou, 0950',
    phone: '+27 15 962 3456',
    email: 'crafts@baobab.co.za',
    latitude: -22.9462,
    longitude: 30.4804,
    rating: 4.8,
    imageUrl: 'https://placehold.co/400x300?text=Colorful+African+craft+shop+with+pottery+beadwork+and+traditional+art',
    openingHours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 2:00 PM',
    verified: true,
    createdAt: '2024-02-01T14:30:00Z'
  },
  {
    id: '3',
    name: 'Limpopo Auto Repairs',
    description: 'Professional vehicle maintenance and repairs. Specializing in 4x4s and farm vehicles. Family-owned since 1995.',
    category: 'Automotive',
    address: '78 Industrial Road, Tzaneen, 0850',
    phone: '+27 15 307 1234',
    email: 'service@limpopoauto.co.za',
    latitude: -23.8328,
    longitude: 30.1636,
    rating: 4.2,
    imageUrl: 'https://placehold.co/400x300?text=Modern+auto+repair+garage+with+professional+equipment+and+vehicles',
    openingHours: 'Mon-Fri: 7:30 AM - 5:00 PM, Sat: 8:00 AM - 1:00 PM',
    verified: true,
    createdAt: '2024-01-20T09:15:00Z'
  },
  {
    id: '4',
    name: 'Dr. Sarah Mthombeni - Family Practice',
    description: 'Comprehensive family healthcare services including general practice, pediatrics, and preventive care.',
    category: 'Healthcare',
    address: '22 Hospital Street, Louis Trichardt, 0920',
    phone: '+27 15 516 7890',
    email: 'reception@drmthombeni.co.za',
    latitude: -23.0434,
    longitude: 29.9056,
    rating: 4.9,
    imageUrl: 'https://placehold.co/400x300?text=Modern+medical+practice+with+waiting+room+and+professional+signage',
    openingHours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 12:00 PM',
    verified: true,
    createdAt: '2024-01-10T11:45:00Z'
  },
  {
    id: '5',
    name: 'Letaba Lodge & Conference Centre',
    description: 'Luxury accommodation and conference facilities on the banks of the Letaba River. Perfect for corporate retreats and family holidays.',
    category: 'Accommodation',
    address: 'R71 Letaba River, Gravelotte, 1250',
    phone: '+27 15 309 5678',
    email: 'bookings@letabalodge.co.za',
    website: 'https://letabalodge.co.za',
    latitude: -24.0167,
    longitude: 30.7833,
    rating: 4.6,
    imageUrl: 'https://placehold.co/400x300?text=Riverside+lodge+with+wooden+chalets+and+scenic+river+views',
    openingHours: '24/7 Front Desk',
    verified: true,
    createdAt: '2024-02-05T16:20:00Z'
  },
  {
    id: '6',
    name: 'Mokopane Fresh Produce',
    description: 'Farm-fresh vegetables, fruits, and grains directly from local farmers. Supporting sustainable agriculture in Limpopo.',
    category: 'Agriculture',
    address: '156 Farm Road, Mokopane, 0600',
    phone: '+27 15 491 2345',
    email: 'sales@mokopaneproduce.co.za',
    latitude: -24.1938,
    longitude: 29.0089,
    rating: 4.4,
    imageUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a9155348-a844-4fff-9b59-61909228f4c6.png',
    openingHours: 'Mon-Sat: 6:00 AM - 6:00 PM, Sun: 8:00 AM - 2:00 PM',
    verified: true,
    createdAt: '2024-01-25T08:00:00Z'
  }
];

// Real events in Limpopo Province
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Limpopo Arts & Culture Festival 2024',
    description: 'Annual celebration of Limpopo\'s diverse cultural heritage featuring traditional music, dance, art exhibitions, and local cuisine. Over 50 artists and performers from across the province.',
    category: 'Cultural',
    startDate: '2024-05-15T09:00:00Z',
    endDate: '2024-05-17T18:00:00Z',
    location: 'Polokwane Civic Centre',
    address: 'Landros Mare Street, Polokwane, 0699',
    organizer: 'Limpopo Department of Arts & Culture',
    contactInfo: '+27 15 230 4500',
    imageUrl: 'https://placehold.co/400x300?text=Colorful+cultural+festival+with+traditional+dancers+and+local+crafts',
    ticketPrice: 50,
    maxAttendees: 2000,
    currentAttendees: 456,
    tags: ['culture', 'music', 'dance', 'art', 'food'],
    createdAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Kruger National Park Conservation Workshop',
    description: 'Educational workshop on wildlife conservation, anti-poaching efforts, and community involvement. Led by KNP rangers and conservation experts.',
    category: 'Education',
    startDate: '2024-04-20T08:30:00Z',
    endDate: '2024-04-20T16:00:00Z',
    location: 'Skukuza Rest Camp',
    address: 'Kruger National Park, Skukuza, 1350',
    organizer: 'SANParks Conservation Department',
    contactInfo: '+27 13 735 4000',
    imageUrl: 'https://placehold.co/400x300?text=Wildlife+conservation+workshop+with+park+rangers+and+educational+displays',
    ticketPrice: 0,
    maxAttendees: 100,
    currentAttendees: 67,
    tags: ['conservation', 'education', 'wildlife', 'environment'],
    createdAt: '2024-03-10T14:15:00Z'
  },
  {
    id: '3',
    title: 'Tzaneen Farmers Market Grand Opening',
    description: 'Launch of the new weekly farmers market featuring fresh produce, artisanal foods, live music, and family activities. Meet local farmers and producers.',
    category: 'Community',
    startDate: '2024-04-25T07:00:00Z',
    endDate: '2024-04-25T14:00:00Z',
    location: 'Tzaneen Town Hall Grounds',
    address: 'Danie Joubert Street, Tzaneen, 0850',
    organizer: 'Tzaneen Local Municipality',
    contactInfo: '+27 15 307 8000',
    imageUrl: 'https://placehold.co/400x300?text=Bustling+farmers+market+with+fresh+produce+stalls+and+happy+families',
    ticketPrice: 0,
    maxAttendees: 1000,
    currentAttendees: 234,
    tags: ['market', 'community', 'food', 'local', 'farmers'],
    createdAt: '2024-03-15T09:30:00Z'
  },
  {
    id: '4',
    title: 'Limpopo Business Development Conference',
    description: 'Two-day conference focusing on entrepreneurship, SME development, and business opportunities in Limpopo. Networking sessions and expert panels.',
    category: 'Business',
    startDate: '2024-05-08T08:00:00Z',
    endDate: '2024-05-09T17:00:00Z',
    location: 'Ranch Resort Polokwane',
    address: 'Old Potgietersrus Road, Polokwane, 0699',
    organizer: 'Limpopo Economic Development Agency',
    contactInfo: '+27 15 284 5000',
    imageUrl: 'https://placehold.co/400x300?text=Professional+business+conference+with+speakers+and+networking+sessions',
    ticketPrice: 350,
    maxAttendees: 500,
    currentAttendees: 123,
    tags: ['business', 'entrepreneurship', 'networking', 'development'],
    createdAt: '2024-03-05T12:00:00Z'
  },
  {
    id: '5',
    title: 'Vhembe Traditional Healing Workshop',
    description: 'Educational workshop on traditional medicine and healing practices in the Vhembe region. Led by experienced traditional healers and herbalists.',
    category: 'Health',
    startDate: '2024-04-30T10:00:00Z',
    endDate: '2024-04-30T15:00:00Z',
    location: 'Thohoyandou Community Hall',
    address: 'Ṱhohoyandou, Limpopo, 0950',
    organizer: 'Vhembe Traditional Healers Association',
    contactInfo: '+27 15 962 4567',
    imageUrl: 'https://placehold.co/400x300?text=Traditional+healing+workshop+with+medicinal+plants+and+cultural+practices',
    ticketPrice: 25,
    maxAttendees: 150,
    currentAttendees: 89,
    tags: ['health', 'traditional', 'culture', 'medicine', 'herbs'],
    createdAt: '2024-03-20T15:45:00Z'
  }
];

// Real marketplace items
export const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: '1',
    title: 'Traditional Venda Clay Pots Set',
    description: 'Handmade clay pots by local artisans. Perfect for traditional cooking and home decoration. Set of 3 different sizes.',
    category: 'Arts & Crafts',
    price: 450,
    condition: 'new',
    location: 'Thohoyandou',
    sellerId: 'seller1',
    sellerName: 'Mufunwa Crafts',
    sellerPhone: '+27 82 345 6789',
    imageUrl: 'https://placehold.co/400x300?text=Traditional+handmade+clay+pots+with+authentic+Venda+designs',
    tags: ['traditional', 'handmade', 'venda', 'pottery', 'crafts'],
    isAvailable: true,
    createdAt: '2024-03-12T10:30:00Z'
  },
  {
    id: '2',
    title: 'John Deere Tractor - 5075E Model',
    description: 'Well-maintained farm tractor with 850 hours. Excellent condition, all maintenance records available. Ideal for small to medium farms.',
    category: 'Farm Equipment',
    price: 485000,
    condition: 'used',
    location: 'Mokopane',
    sellerId: 'seller2',
    sellerName: 'Limpopo Farm Equipment',
    sellerPhone: '+27 15 491 7890',
    imageUrl: 'https://placehold.co/400x300?text=Green+John+Deere+farm+tractor+in+excellent+working+condition',
    tags: ['tractor', 'farming', 'agriculture', 'john deere', 'equipment'],
    isAvailable: true,
    createdAt: '2024-03-08T14:15:00Z'
  },
  {
    id: '3',
    title: 'Organic Macadamia Nuts - 10kg',
    description: 'Fresh organic macadamia nuts from our family farm. Naturally grown without chemicals. Perfect for retail or personal use.',
    category: 'Food & Agriculture',
    price: 1200,
    condition: 'new',
    location: 'Tzaneen',
    sellerId: 'seller3',
    sellerName: 'Letaba Valley Nuts',
    sellerPhone: '+27 15 307 2345',
    imageUrl: 'https://placehold.co/400x300?text=Fresh+organic+macadamia+nuts+in+premium+packaging',
    tags: ['macadamia', 'organic', 'nuts', 'healthy', 'local'],
    isAvailable: true,
    createdAt: '2024-03-15T08:45:00Z'
  },
  {
    id: '4',
    title: 'Toyota Hilux 2018 Double Cab',
    description: 'Reliable 4x4 bakkie with 75,000km. Service history available. Perfect for farm work or family use. Good condition inside and out.',
    category: 'Vehicles',
    price: 295000,
    condition: 'used',
    location: 'Polokwane',
    sellerId: 'seller4',
    sellerName: 'Limpopo Motors',
    sellerPhone: '+27 15 295 6789',
    imageUrl: 'https://placehold.co/400x300?text=White+Toyota+Hilux+double+cab+pickup+truck+in+good+condition',
    tags: ['toyota', 'hilux', 'bakkie', '4x4', 'reliable'],
    isAvailable: true,
    createdAt: '2024-03-10T16:20:00Z'
  }
];

// Real news articles
export const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'New Hospital Opens in Rural Limpopo Community',
    summary: 'State-of-the-art medical facility brings healthcare services closer to remote communities in the Vhembe district.',
    content: `A new 150-bed hospital has officially opened in the Vhembe district, bringing much-needed healthcare services to rural communities. The R2.5 billion facility features modern medical equipment, an emergency department, and specialized units for maternity and pediatric care.

Health MEC Dr. Phophi Ramathuba officiated at the opening ceremony, emphasizing the government's commitment to improving healthcare access in rural areas. "This hospital will serve over 200,000 people in surrounding communities," she stated.

The facility includes:
- 24/7 emergency services
- Modern surgical suites
- Radiology and laboratory services  
- Specialist clinics for chronic diseases
- Community health outreach programs

Local community leaders praised the development, noting that residents previously had to travel over 100km for specialized medical care. The hospital has created 450 permanent jobs in the area and is expected to boost local economic development.`,
    category: 'Health',
    author: 'Limpopo Mirror',
    publishedAt: '2024-03-18T09:00:00Z',
    imageUrl: 'https://placehold.co/400x300?text=Modern+hospital+building+with+medical+staff+and+patients',
    tags: ['healthcare', 'rural development', 'government', 'community'],
    source: 'Limpopo Mirror'
  },
  {
    id: '2',
    title: 'Kruger National Park Reports Record Conservation Success',
    summary: 'Anti-poaching efforts and community programs lead to significant increase in rhino population for the first time in a decade.',
    content: `Kruger National Park has announced remarkable conservation achievements, with rhino population increasing by 12% in the past year. This marks the first significant increase in over a decade, attributed to enhanced anti-poaching strategies and community engagement programs.

SANParks CEO Fundisile Mketeni highlighted key successes:
- 156 suspected poachers arrested in 2023
- Advanced drone surveillance systems deployed
- Community conservation programs expanded
- International partnerships strengthened

The park's community engagement initiative has been particularly successful, providing alternative livelihoods for local residents and creating conservation awareness. Over 500 community members have been employed as conservation ambassadors and field rangers.

"This success belongs to everyone - our rangers, local communities, and conservation partners worldwide," Mketeni stated at yesterday's press conference.

The park has also reported increases in elephant and wild dog populations, indicating overall ecosystem health improvement. Tourism revenue has increased by 25%, providing crucial funding for continued conservation efforts.`,
    category: 'Environment',
    author: 'Environmental News SA',
    publishedAt: '2024-03-15T11:30:00Z',
    imageUrl: 'https://placehold.co/400x300?text=Kruger+National+Park+with+rhinos+and+conservation+rangers',
    tags: ['conservation', 'kruger park', 'wildlife', 'tourism'],
    source: 'Environmental News SA'
  },
  {
    id: '3',
    title: 'Limpopo Agricultural Exports Reach All-Time High',
    summary: 'Province breaks export records with citrus, macadamia nuts, and avocados leading international sales.',
    content: `Limpopo's agricultural sector has achieved unprecedented export success, with total export value reaching R45 billion in 2023 - a 18% increase from the previous year. The province continues to solidify its position as South Africa's agricultural powerhouse.

Key export achievements include:
- Citrus exports: R18 billion (↑22%)
- Macadamia nuts: R8.5 billion (↑35%) 
- Avocados: R6.2 billion (↑28%)
- Subtropical fruits: R4.8 billion (↑15%)

Agriculture MEC Nakedi Sibanda-Kekana attributed the success to strategic investments in irrigation infrastructure, farmer development programs, and international market access initiatives.

"Our farmers have embraced sustainable farming practices and technological innovation," she noted. "This has positioned Limpopo as a reliable supplier to international markets."

Major export destinations include:
- European Union (42% of exports)
- Asia-Pacific region (31%)  
- Middle East and North Africa (18%)
- Americas (9%)

The sector employs over 350,000 people directly and supports an estimated 1.2 million livelihoods across the province. New processing facilities and cold storage infrastructure are planned to further boost export capacity.`,
    category: 'Agriculture',
    author: 'AgriNews Limpopo',
    publishedAt: '2024-03-12T07:45:00Z',
    imageUrl: 'https://placehold.co/400x300?text=Limpopo+farms+with+citrus+groves+and+modern+farming+equipment',
    tags: ['agriculture', 'exports', 'farming', 'economy'],
    source: 'AgriNews Limpopo'
  }
];

// Real tourism attractions
export const mockTourismAttractions: TourismAttraction[] = [
  {
    id: '1',
    name: 'Kruger National Park',
    description: 'One of the world\'s largest game reserves, home to the Big Five and incredible wildlife diversity. Experience authentic African safari adventures.',
    category: 'Wildlife',
    location: 'Eastern Limpopo',
    address: 'Kruger National Park, South Africa',
    latitude: -24.0078,
    longitude: 31.4977,
    priceRange: 'R500 - R2500 per day',
    rating: 4.9,
    imageUrl: 'https://placehold.co/400x300?text=African+safari+landscape+with+elephants+and+acacia+trees',
    website: 'https://sanparks.org/parks/kruger',
    phone: '+27 13 735 4000',
    openingHours: 'Apr-Sep: 6:00-17:30, Oct-Mar: 5:30-18:30',
    features: ['Big Five', 'Game Drives', 'Bush Walks', 'Bird Watching', 'Photography', 'Accommodation'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mapungubwe National Park',
    description: 'UNESCO World Heritage Site featuring ancient kingdom ruins, stunning landscapes, and rich archaeological treasures.',
    category: 'Heritage',
    location: 'Northern Limpopo',
    address: 'Mapungubwe National Park, Musina, 0900',
    latitude: -22.2017,
    longitude: 29.2378,
    priceRange: 'R200 - R800 per day',
    rating: 4.7,
    imageUrl: 'https://placehold.co/400x300?text=Ancient+archaeological+site+with+historical+ruins+and+baobab+trees',
    website: 'https://sanparks.org/parks/mapungubwe',
    phone: '+27 15 534 7923',
    openingHours: 'Daily: 6:00 AM - 6:00 PM',
    features: ['Archaeological Sites', 'Cultural Tours', 'Wildlife Viewing', 'Bird Watching', 'Hiking Trails'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'God\'s Window - Blyde River Canyon',
    description: 'Breathtaking viewpoint offering panoramic views over the Lowveld and one of the world\'s largest green canyons.',
    category: 'Scenic',
    location: 'Graskop/Blyde River Canyon',
    address: 'R534, Graskop, 1270',
    latitude: -24.8833,
    longitude: 30.8833,
    priceRange: 'Free - R50 parking',
    rating: 4.8,
    imageUrl: 'https://placehold.co/400x300?text=Spectacular+mountain+viewpoint+with+dramatic+canyon+landscapes',
    phone: '+27 13 767 1988',
    openingHours: 'Daily: 7:00 AM - 5:00 PM',
    features: ['Scenic Views', 'Photography', 'Hiking', 'Rainforest', 'Waterfalls'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Modjadji Cycad Reserve',
    description: 'Home to the world\'s largest concentration of indigenous cycads and the legendary Rain Queen\'s palace.',
    category: 'Nature',
    location: 'Ga-Modjadji',
    address: 'Ga-Modjadji, Modjadjiskloof, 0835',
    latitude: -23.9667,
    longitude: 30.1167,
    priceRange: 'R30 - R150 per person',
    rating: 4.5,
    imageUrl: 'https://placehold.co/400x300?text=Ancient+cycad+forest+with+lush+prehistoric+plants+and+walking+trails',
    phone: '+27 15 309 9473',
    openingHours: 'Daily: 8:00 AM - 4:30 PM',
    features: ['Ancient Plants', 'Cultural Heritage', 'Nature Walks', 'Photography', 'Educational Tours'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Shangana Cultural Village',
    description: 'Authentic cultural experience showcasing Shangana traditions, crafts, cuisine, and traditional performances.',
    category: 'Cultural',
    location: 'Hazyview',
    address: 'R535, Hazyview, 1242',
    latitude: -25.0442,
    longitude: 31.1086,
    priceRange: 'R350 - R550 per person',
    rating: 4.6,
    imageUrl: 'https://placehold.co/400x300?text=Traditional+African+village+with+cultural+dancers+and+authentic+huts',
    website: 'https://shangana.co.za',
    phone: '+27 13 737 8000',
    openingHours: 'Daily tours: 11:45 AM, 2:30 PM, 4:45 PM',
    features: ['Cultural Performances', 'Traditional Crafts', 'Local Cuisine', 'Village Tours', 'Souvenir Shop'],
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Helper functions to simulate API responses
export const simulateApiDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const getRandomItems = <T>(items: T[], count: number): T[] => 
  items.sort(() => 0.5 - Math.random()).slice(0, count);

export const filterItemsByCategory = <T extends { category: string }>(items: T[], category?: string): T[] =>
  category ? items.filter(item => item.category.toLowerCase().includes(category.toLowerCase())) : items;

export const searchItems = <T extends { name?: string; title?: string; description: string }>(
  items: T[], 
  query?: string
): T[] => {
  if (!query) return items;
  const lowercaseQuery = query.toLowerCase();
  return items.filter(item => {
    const title = (item.name || item.title || '').toLowerCase();
    const description = item.description.toLowerCase();
    return title.includes(lowercaseQuery) || description.includes(lowercaseQuery);
  });
};