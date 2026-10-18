'use client';

interface HotelItem {
  id: string;
  name: string;
  badge: string;
  icon: string;
  rating: number;
  reviewsCount: string;
  address: string;
  reviewText: string;
  features: string[];
  hours: string;
  lat: number;
  lng: number;
}

const HOTELS: HotelItem[] = [
  {
    id: 'lemon_tree',
    name: 'Lemon Tree Wildlife Resort',
    badge: 'TALA ZONE',
    icon: '🌿',
    rating: 4.3,
    reviewsCount: '489 reviews',
    address: 'Village Bhijariya, Post Bandhavgarh (Tala), Umaria, MP 484664',
    reviewText: 'Located in heart of Tala range, where you get the core safari start. The staff was really helpful and courteous. Rooms were spacious, clean and had heaters. Citrus cafe was also great.',
    features: ['Swimming Pool', 'Spa', 'Restaurant', 'Open Shower'],
    hours: '🟢 Open 24 hours',
    lat: 23.6942,
    lng: 81.0189,
  },
  {
    id: 'syna_tiger',
    name: 'Syna Tiger Resort',
    badge: '85 ACRES',
    icon: '🦁',
    rating: 4.4,
    reviewsCount: '330 reviews',
    address: 'Tala, Bandhavgarh National Park, Manpur, Umaria, MP 484664',
    reviewText: 'Great spot for spotting tigers. Courteous and very helpful staff. Yummy food and amazing hospitality. Built on a large land with 85 acres in Bandhavgarh — felt like living on the clouds!',
    features: ['Vegetable Garden', 'Cycling', 'Market Nearby', 'Buffet'],
    hours: '🟢 Open 24 hours',
    lat: 23.7028,
    lng: 81.0315,
  },
  {
    id: 'tiger_trails',
    name: 'Tiger Trails Resort',
    badge: '2KM FROM TALA',
    icon: '🌳',
    rating: 4.2,
    reviewsCount: '683 reviews',
    address: 'Village & PO Tala, Bandhavgarh National Park, Jamunara, MP 484664',
    reviewText: 'Excellent location just 2 kms from Tala gate — one of the best for Safari and tiger sighting. Food was simple but very tasty. In-house flute music during dinner. Packed breakfast for morning safari.',
    features: ['Jungle Cottages', 'Table Tennis', 'Carrom', 'Campfire'],
    hours: '🕐 Hours not listed',
    lat: 23.6894,
    lng: 81.0152,
  },
  {
    id: 'mogli_jungle',
    name: 'Mogli Jungle Resort',
    badge: 'MOST REVIEWED',
    icon: '🐯',
    rating: 4.3,
    reviewsCount: '1,574 reviews',
    address: 'Bijharia, Tala, Jamunara, MP 484661',
    reviewText: 'An ideal resort for rest and relaxation in the heart of a jungle. Nature lovers will love it. Safari jeeps pick you up and drop at the hotel. Excellent staff, service and ambience. Once you are here, you don\'t want to leave.',
    features: ['Swimming Pool', 'Spa', 'Wedding Venue', 'Restaurant'],
    hours: '🟢 Open 24 hours',
    lat: 23.6961,
    lng: 81.0211,
  },
  {
    id: 'bandhavgarh_tiger',
    name: 'Bandhavgarh Tiger Resort',
    badge: 'TOP RATED 4.8★',
    icon: '🌄',
    rating: 4.8,
    reviewsCount: '241 reviews',
    address: 'Bandhavgarh Tiger Reserve, Tala, MP 484664',
    reviewText: 'An absolutely legendary experience! The tiger sightings were incredible, but the resort made the trip truly special. Spacious property with a great sense of peace. Loved the pool facility and sports area. Food was delicious.',
    features: ['Swimming Pool', 'Sports Area', 'Bonfire', 'Spacious Rooms'],
    hours: '🕐 Hours not listed',
    lat: 23.7011,
    lng: 81.0267,
  },
  {
    id: 'mpt_white_tiger',
    name: 'MPT White Tiger Forest Lodge',
    badge: 'MPT PROPERTY',
    icon: '🏕️',
    rating: 4.6,
    reviewsCount: '1,123 reviews',
    address: 'Village Tala, Post Tala, Manpur, Bandhavgarh, MP 484664',
    reviewText: 'Strategically located at the edge of the core area of the Tala Zone, just minutes away from the Tala entry gate. Meandering streams, grand banyan trees, swimming pool, and dedicated activity zones. Rooms spic and span.',
    features: ['Swimming Pool', 'Banyan Trees', 'Core Zone Access', 'Multi-Cuisine'],
    hours: '🕐 Hours not listed',
    lat: 23.7052,
    lng: 81.0289,
  },
  {
    id: 'aranyak_resort',
    name: 'Aranyak Resort',
    badge: 'BIRD PARADISE',
    icon: '🦅',
    rating: 4.5,
    reviewsCount: '826 reviews',
    address: 'Deori Dol, Bijariya Road, Village Kuchwahi, Bandhavgarh NP, Tala, MP 484664',
    reviewText: 'A lovely place with cozy, comfortable cottages, excellent food and wonderful staff. Private jungle safaris, pick-up from Khajuraho, drop at Jabalpur. Rustic, scenic property perfect for nature lovers. Exceptional hospitality by Ram & team.',
    features: ['Private Safaris', 'Transfer Service', 'Birds & Wildlife', 'Local Delicacy'],
    hours: '🟢 Open 24 hours',
    lat: 23.7091,
    lng: 81.0182,
  },
  {
    id: 'monsoon_forest',
    name: 'Monsoon Forest by Greetoe',
    badge: 'PERFECT 5.0★',
    icon: '🌙',
    rating: 5.0,
    reviewsCount: '20 reviews',
    address: 'Bandhavgarh Tiger Reserve, Tala, MP 484664',
    reviewText: 'Located just 1.5km from the Tala Gate in the buffer zone. Features 10 "Nest" rooms — surprisingly plush and spacious with AC, geysers, and coffee stations. A paradise for bird lovers. Luxury rooms with 5-star service.',
    features: ['10 Nest Rooms', 'Buffer Zone', 'Birdwatching', 'Coffee Station'],
    hours: '🕐 Hours not listed',
    lat: 23.6877,
    lng: 81.0341,
  },
];

interface BandhavgarhHotelsProps {
  onBookCabToHotel: (hotel: { name: string; address: string; lat: number; lng: number }) => void;
}

export default function BandhavgarhHotels({ onBookCabToHotel }: BandhavgarhHotelsProps) {
  return (
    <div className="w-full bg-[#fdfaf6] text-[#2d1f12] rounded-3xl overflow-hidden border border-[#e8ddd0] shadow-2xl space-y-12 pb-12 font-serif selection:bg-[#d4722a] selection:text-white">
      {/* Luxury Jungle Hero */}
      <section className="relative min-h-[460px] bg-[#1a2e1a] text-center flex flex-col justify-center items-center p-8 overflow-hidden">
        {/* Ambient jungle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a0d] via-[#1a2e1a] to-[#2d4a1e] opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-block border border-[#c9a84c] text-[#c9a84c] text-xs uppercase tracking-[0.25em] px-4 py-1.5 font-sans font-bold">
            Bandhavgarh · Tala · Madhya Pradesh
          </div>

          <h2 className="text-4xl sm:text-5xl font-normal text-[#f5ede0] leading-tight font-serif">
            Stay in the Heart of the <br />
            <em className="text-[#d4722a] italic font-serif">Tiger&apos;s Land</em>
          </h2>

          <p className="text-[#f5ede0]/80 text-base sm:text-lg font-light max-w-lg mx-auto font-sans leading-relaxed">
            Curated resorts and lodges at Bandhavgarh National Park — your gateway to India&apos;s finest tiger territory.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-[#4a3728] text-[#f5ede0] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 font-sans shadow-md">
        <div className="p-4 text-center">
          <span className="text-2xl sm:text-3xl font-black text-[#c9a84c] block font-serif">8</span>
          <span className="text-[11px] text-[#f5ede0]/70 uppercase tracking-widest font-bold">Featured Resorts</span>
        </div>
        <div className="p-4 text-center">
          <span className="text-2xl sm:text-3xl font-black text-[#c9a84c] block font-serif">4.5★</span>
          <span className="text-[11px] text-[#f5ede0]/70 uppercase tracking-widest font-bold">Average Rating</span>
        </div>
        <div className="p-4 text-center">
          <span className="text-2xl sm:text-3xl font-black text-[#c9a84c] block font-serif">5+</span>
          <span className="text-[11px] text-[#f5ede0]/70 uppercase tracking-widest font-bold">Safari Zones</span>
        </div>
        <div className="p-4 text-center">
          <span className="text-2xl sm:text-3xl font-black text-[#c9a84c] block font-serif">24/7</span>
          <span className="text-[11px] text-[#f5ede0]/70 uppercase tracking-widest font-bold">Cab Pickups</span>
        </div>
      </div>

      {/* Hotels Grid Section */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#d4722a] font-bold font-sans">
            Where to Stay
          </span>
          <h3 className="text-3xl sm:text-4xl font-normal text-[#1a2e1a] font-serif">
            Hotels & Resorts in Tala
          </h3>
          <p className="text-[#7a6350] text-sm sm:text-base max-w-xl mx-auto font-sans">
            From jungle-edge cottages to luxury eco-resorts, Bandhavgarh&apos;s Tala zone has stays for every wildlife traveler.
          </p>
          <div className="text-[#d4722a] text-lg opacity-60 tracking-[0.5em] pt-2">✦ ✦ ✦</div>
        </div>

        {/* 8 Hotel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {HOTELS.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white border border-[#e8ddd0] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                {/* Header Graphic */}
                <div className="h-44 bg-gradient-to-tr from-[#1a3320] to-[#2d5a35] flex items-center justify-center relative">
                  <span className="text-5xl drop-shadow-md">{hotel.icon}</span>
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-[#c9a84c] text-[10px] font-bold tracking-wider px-2 py-1 rounded border border-[#c9a84c]/40">
                    {hotel.badge}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#c9a84c] text-sm">★★★★☆</span>
                    <span className="font-bold text-[#2d1f12]">{hotel.rating}</span>
                    <span className="text-[#7a6350] text-[11px]">({hotel.reviewsCount})</span>
                  </div>

                  {/* Title & Address */}
                  <div>
                    <h4 className="text-lg font-bold text-[#1a2e1a] font-serif leading-tight">
                      {hotel.name}
                    </h4>
                    <p className="text-xs text-[#7a6350] flex items-start gap-1 mt-1 leading-snug">
                      <span className="shrink-0 text-amber-600">📍</span>
                      {hotel.address}
                    </p>
                  </div>

                  {/* Review snippet */}
                  <div className="bg-[#f5ede0]/70 p-3 rounded-xl text-xs italic text-[#2d1f12] relative border-l-2 border-[#d4722a] leading-relaxed">
                    &quot;{hotel.reviewText}&quot;
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotel.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-[10px] bg-slate-100 text-[#7a6350] border border-[#e8ddd0] px-2 py-0.5 rounded-md font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] font-medium pt-1 text-emerald-800">
                    {hotel.hours}
                  </div>
                </div>
              </div>

              {/* Direct Cab Booking CTA */}
              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() =>
                    onBookCabToHotel({
                      name: hotel.name,
                      address: hotel.address,
                      lat: hotel.lat,
                      lng: hotel.lng,
                    })
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#d4722a] hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🚖</span> Book Cab to This Resort →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-[#1a2e1a] text-[#f5ede0] rounded-3xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#c9a84c] font-bold font-sans">
              Plan Your Visit
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#f5ede0]">
              Essential Travel Information
            </h3>
            <p className="text-xs sm:text-sm text-[#f5ede0]/70 font-sans max-w-md mx-auto">
              Everything you need to know before your Bandhavgarh adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans pt-2">
            <div className="p-4 rounded-xl border border-[#c9a84c]/30 bg-white/5 space-y-2">
              <span className="text-2xl">🗓️</span>
              <h5 className="font-serif text-[#c9a84c] font-bold text-sm">Best Time to Visit</h5>
              <p className="text-xs text-[#f5ede0]/70 leading-relaxed">
                October to June. Peak season (Feb–May) offers prime tiger sightings around water holes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#c9a84c]/30 bg-white/5 space-y-2">
              <span className="text-2xl">🚗</span>
              <h5 className="font-serif text-[#c9a84c] font-bold text-sm">How to Reach Tala</h5>
              <p className="text-xs text-[#f5ede0]/70 leading-relaxed">
                Nearest railhead is Umaria (35 km) or Shahdol (85 km). Jabalpur Airport is 170 km away.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#c9a84c]/30 bg-white/5 space-y-2">
              <span className="text-2xl">🐅</span>
              <h5 className="font-serif text-[#c9a84c] font-bold text-sm">Safari Zones</h5>
              <p className="text-xs text-[#f5ede0]/70 leading-relaxed">
                Tala, Magadhi, and Khitauli. Tala is world renowned for having the highest tiger density in India.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#c9a84c]/30 bg-white/5 space-y-2">
              <span className="text-2xl">📋</span>
              <h5 className="font-serif text-[#c9a84c] font-bold text-sm">Booking Tips</h5>
              <p className="text-xs text-[#f5ede0]/70 leading-relaxed">
                Safari permits are limited — book 3–6 months in advance. Our registered drivers provide direct station drops!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-[#7a6350] pt-4 font-sans">
        Hotels in <strong>Bandhavgarh Tala, Madhya Pradesh</strong> · Real-time Cab Integration via Shahdol Cab
      </footer>
    </div>
  );
}
