export interface LocationItem {
  id: string;
  name: string;
  hindiName?: string;
  district: 'Shahdol' | 'Umaria' | 'Anuppur' | 'Nearby Cities';
  category: 'transit' | 'hospital' | 'tourist' | 'landmark' | 'commercial' | 'city';
  lat: number;
  lng: number;
  description: string;
}

export const MP_LOCATIONS: LocationItem[] = [
  // ================= SHAHDOL REGION =================
  {
    id: 'sdl_rly',
    name: 'Shahdol Railway Station (SDL)',
    hindiName: 'शहडोल रेलवे स्टेशन',
    district: 'Shahdol',
    category: 'transit',
    lat: 23.2847,
    lng: 81.3542,
    description: 'Major railway junction on Bilaspur-Katni line, Station Road'
  },
  {
    id: 'sdl_bus',
    name: 'Shahdol New Bus Stand',
    hindiName: 'नया बस स्टैंड शहडोल',
    district: 'Shahdol',
    category: 'transit',
    lat: 23.2925,
    lng: 81.3618,
    description: 'Central bus terminal connecting Umaria, Rewa, Katni, and Anuppur'
  },
  {
    id: 'sdl_gandhi_chowk',
    name: 'Gandhi Chowk, Main Market Shahdol',
    hindiName: 'गांधी चौक शहडोल',
    district: 'Shahdol',
    category: 'commercial',
    lat: 23.2872,
    lng: 81.3531,
    description: 'City center, shopping hub and commercial market'
  },
  {
    id: 'sdl_virat_mandir',
    name: 'Virat Temple, Sohagpur',
    hindiName: 'विराट मंदिर, सोहागपुर',
    district: 'Shahdol',
    category: 'tourist',
    lat: 23.3051,
    lng: 81.3485,
    description: '10th-century Kalachuri heritage Lord Shiva temple'
  },
  {
    id: 'sdl_med_college',
    name: 'Government Medical College & Hospital Shahdol',
    hindiName: 'शासकीय मेडिकल कॉलेज शहडोल',
    district: 'Shahdol',
    category: 'hospital',
    lat: 23.2624,
    lng: 81.3328,
    description: 'Apex multispeciality hospital on Rewa Road'
  },
  {
    id: 'sdl_univ',
    name: 'Pt. S.N. Shukla University (PTSNS)',
    hindiName: 'पं. एस.एन. शुक्ला विश्वविद्यालय',
    district: 'Shahdol',
    category: 'landmark',
    lat: 23.3102,
    lng: 81.3712,
    description: 'University campus, Nawalpur'
  },
  {
    id: 'sdl_burhar',
    name: 'Burhar Town & Railway Station',
    hindiName: 'बुढार',
    district: 'Shahdol',
    category: 'transit',
    lat: 23.2185,
    lng: 81.5367,
    description: 'Commercial trading center on NH-43'
  },
  {
    id: 'sdl_dhanpuri',
    name: 'Dhanpuri Coal Town',
    hindiName: 'धनपुरी',
    district: 'Shahdol',
    category: 'landmark',
    lat: 23.1932,
    lng: 81.5543,
    description: 'Coal mining hub near Amlai'
  },
  {
    id: 'sdl_amlai',
    name: 'Amlai (Orient Paper Mills)',
    hindiName: 'अमलाई पेपर मिल',
    district: 'Shahdol',
    category: 'landmark',
    lat: 23.1812,
    lng: 81.6041,
    description: 'Paper mill industrial town on Sone river'
  },
  {
    id: 'sdl_gohparu',
    name: 'Gohparu Tehsil Junction',
    hindiName: 'गोहपारू चौराहा',
    district: 'Shahdol',
    category: 'commercial',
    lat: 23.4751,
    lng: 81.3289,
    description: 'Tehsil crossing on Shahdol-Rewa Highway'
  },
  {
    id: 'sdl_jaisinghnagar',
    name: 'Jaisinghnagar Market',
    hindiName: 'जयसिंहनगर',
    district: 'Shahdol',
    category: 'commercial',
    lat: 23.6338,
    lng: 81.3855,
    description: 'Northern town towards Beohari'
  },
  {
    id: 'sdl_beohari',
    name: 'Beohari Town & Station',
    hindiName: 'ब्यौहारी रेलवे स्टेशन',
    district: 'Shahdol',
    category: 'transit',
    lat: 24.0189,
    lng: 81.3814,
    description: 'Major transit town near Ban Sagar reservoir'
  },

  // ================= UMARIA REGION =================
  {
    id: 'umr_rly',
    name: 'Umaria Railway Station (UMR)',
    hindiName: 'उमरिया रेलवे स्टेशन',
    district: 'Umaria',
    category: 'transit',
    lat: 23.5246,
    lng: 80.8354,
    description: 'District rail head on Katni-Bilaspur route'
  },
  {
    id: 'umr_bus',
    name: 'Umaria Central Bus Stand',
    hindiName: 'उमरिया बस स्टैंड',
    district: 'Umaria',
    category: 'transit',
    lat: 23.5281,
    lng: 80.8398,
    description: 'Main bus depot on NH-43 connecting Katni & Shahdol'
  },
  {
    id: 'umr_collectorate',
    name: 'District Hospital & Collectorate, Umaria',
    hindiName: 'कलेक्ट्रेट एवं जिला अस्पताल उमरिया',
    district: 'Umaria',
    category: 'hospital',
    lat: 23.5352,
    lng: 80.8291,
    description: 'Administrative campus and civil hospital'
  },
  {
    id: 'umr_bandhavgarh_tala',
    name: 'Bandhavgarh Tiger Reserve - Tala Gate',
    hindiName: 'बांधवगढ़ - ताला गेट (टाइगर रिजर्व)',
    district: 'Umaria',
    category: 'tourist',
    lat: 23.7011,
    lng: 81.0267,
    description: 'Main safari gate, ancient Bandhavgarh fort & eco-resorts'
  },
  {
    id: 'umr_bandhavgarh_magadhi',
    name: 'Bandhavgarh - Magadhi Safari Gate',
    hindiName: 'बांधवगढ़ - मगधी गेट',
    district: 'Umaria',
    category: 'tourist',
    lat: 23.6842,
    lng: 81.0654,
    description: 'Key jungle safari entry zone'
  },
  {
    id: 'umr_pali',
    name: 'Birsinghpur Pali - Birhasini Temple & Power Plant',
    hindiName: 'बीरसिंहपुर पाली - बिरासिनी माता मंदिर',
    district: 'Umaria',
    category: 'tourist',
    lat: 23.3644,
    lng: 81.0422,
    description: 'Maa Birhasini Shaktipeeth temple and Sanjay Gandhi Thermal Power Station'
  },
  {
    id: 'umr_nowrozabad',
    name: 'Nowrozabad Mining Town',
    hindiName: 'नौरोजाबाद',
    district: 'Umaria',
    category: 'commercial',
    lat: 23.4471,
    lng: 80.9328,
    description: 'SECL coalfield township between Umaria & Pali'
  },
  {
    id: 'umr_chandia',
    name: 'Chandia Road Station & Market',
    hindiName: 'चंदिया रोड',
    district: 'Umaria',
    category: 'transit',
    lat: 23.6548,
    lng: 80.7025,
    description: 'Tehsil town on border of Katni'
  },
  {
    id: 'umr_karkeli',
    name: 'Karkeli Railway Station & Block',
    hindiName: 'करकेली',
    district: 'Umaria',
    category: 'transit',
    lat: 23.4831,
    lng: 80.8924,
    description: 'Rural administrative hub on NH-43'
  },
  {
    id: 'umr_manpur',
    name: 'Manpur Chowk',
    hindiName: 'मानपुर चौराहा',
    district: 'Umaria',
    category: 'commercial',
    lat: 23.8341,
    lng: 81.1278,
    description: 'Commercial highway junction near Bandhavgarh'
  },

  // ================= ANUPPUR REGION =================
  {
    id: 'apr_rly',
    name: 'Anuppur Junction (APR)',
    hindiName: 'अनूपपुर जंक्शन रेलवे स्टेशन',
    district: 'Anuppur',
    category: 'transit',
    lat: 23.1039,
    lng: 81.6917,
    description: 'Key 4-way railway junction connecting Katni, Bilaspur & Chirmiri'
  },
  {
    id: 'apr_bus',
    name: 'Anuppur Bus Stand & Collectorate',
    hindiName: 'अनूपपुर बस स्टैंड',
    district: 'Anuppur',
    category: 'transit',
    lat: 23.1115,
    lng: 81.6881,
    description: 'District administrative center and main bus terminal'
  },
  {
    id: 'apr_amarkantak_temple',
    name: 'Amarkantak - Narmada Udgam Temple',
    hindiName: 'अमरकंटक - माँ नर्मदा उद्गम मंदिर',
    district: 'Anuppur',
    category: 'tourist',
    lat: 22.6738,
    lng: 81.7589,
    description: 'Holy pilgrimage center, origin point of River Narmada and Sone'
  },
  {
    id: 'apr_amarkantak_kapildhara',
    name: 'Amarkantak - Kapildhara Waterfall',
    hindiName: 'कपिलधारा जलप्रपात',
    district: 'Anuppur',
    category: 'tourist',
    lat: 22.6983,
    lng: 81.7214,
    description: 'Iconic 100-ft holy waterfall on the Narmada in Maikal hills'
  },
  {
    id: 'apr_kotma',
    name: 'Kotma Town & Coalfields',
    hindiName: 'कोतमा',
    district: 'Anuppur',
    category: 'commercial',
    lat: 23.2038,
    lng: 81.9682,
    description: 'Commercial town on Chirmiri railway branch'
  },
  {
    id: 'apr_chachai',
    name: 'Chachai Thermal Power Station',
    hindiName: 'चचाई पावर प्लांट',
    district: 'Anuppur',
    category: 'landmark',
    lat: 23.1582,
    lng: 81.6375,
    description: 'MPPGCL power generation station on Sone river'
  },
  {
    id: 'apr_jaithari',
    name: 'Jaithari & Moser Baer / Hindustan Power',
    hindiName: 'जैतहरी पावर प्लांट',
    district: 'Anuppur',
    category: 'landmark',
    lat: 23.0345,
    lng: 81.7821,
    description: 'Industrial thermal power complex'
  },
  {
    id: 'apr_rajendragram',
    name: 'Rajendragram (Pushprajgarh Hill Station)',
    hindiName: 'राजेन्द्रग्राम (पुष्पराजगढ़)',
    district: 'Anuppur',
    category: 'landmark',
    lat: 22.8423,
    lng: 81.7211,
    description: 'Scenic tribal hill market leading to Amarkantak'
  },
  {
    id: 'apr_bijuri',
    name: 'Bijuri Railway Junction',
    hindiName: 'बिजुरी',
    district: 'Anuppur',
    category: 'transit',
    lat: 23.2541,
    lng: 82.1245,
    description: 'Eastern coalfield border station'
  },
  {
    id: 'apr_venkatnagar',
    name: 'Venkatnagar Border Station',
    hindiName: 'वेंकटनगर',
    district: 'Anuppur',
    category: 'transit',
    lat: 22.9511,
    lng: 81.8923,
    description: 'Border station connecting towards Pendra Road & Bilaspur'
  },

  // ================= NEARBY CONNECTING CITIES =================
  {
    id: 'city_katni',
    name: 'Katni Junction & City (कटनी)',
    hindiName: 'कटनी जंक्शन',
    district: 'Nearby Cities',
    category: 'city',
    lat: 23.8343,
    lng: 80.3957,
    description: 'Major railway super-junction and limestone hub, western link to Umaria'
  },
  {
    id: 'city_rewa',
    name: 'Rewa City & Railway Station (रीवा)',
    hindiName: 'रीवा शहर',
    district: 'Nearby Cities',
    category: 'city',
    lat: 24.5362,
    lng: 81.3037,
    description: 'Divisional hub and white tiger land, directly connected north via NH-39'
  },
  {
    id: 'city_maihar',
    name: 'Maihar - Maa Sharda Temple (मैहर)',
    hindiName: 'मैहर - माँ शारदा मंदिर',
    district: 'Nearby Cities',
    category: 'city',
    lat: 24.2678,
    lng: 80.7583,
    description: 'Famed hilltop Shaktipeeth pilgrimage between Katni & Satna'
  },
  {
    id: 'city_satna',
    name: 'Satna City & Station (सतना)',
    hindiName: 'सतना रेलवे स्टेशन',
    district: 'Nearby Cities',
    category: 'city',
    lat: 24.5800,
    lng: 80.8300,
    description: 'Industrial cement city & junction on Jabalpur-Allahabad line'
  },
  {
    id: 'city_dindori',
    name: 'Dindori District Headquarter (डिंडौरी)',
    hindiName: 'डिंडौरी शहर',
    district: 'Nearby Cities',
    category: 'city',
    lat: 22.9555,
    lng: 81.0805,
    description: 'Southern neighbor bordering Amarkantak and Baiga tribal heartland'
  },
  {
    id: 'city_sidhi',
    name: 'Sidhi City & Bus Stand (सीधी)',
    hindiName: 'सीधी',
    district: 'Nearby Cities',
    category: 'city',
    lat: 24.4100,
    lng: 81.8800,
    description: 'Northeastern neighbor city connecting Sanjay-Dubri Tiger Reserve'
  },
  {
    id: 'city_manendragarh',
    name: 'Manendragarh City (मनेंद्रगढ़)',
    hindiName: 'मनेंद्रगढ़',
    district: 'Nearby Cities',
    category: 'city',
    lat: 23.2100,
    lng: 82.2000,
    description: 'Chhattisgarh gateway city adjacent to Kotma & Bijuri'
  },
  {
    id: 'city_bilaspur',
    name: 'Bilaspur City Junction (बिलासपुर)',
    hindiName: 'बिलासपुर जंक्शन',
    district: 'Nearby Cities',
    category: 'city',
    lat: 22.0797,
    lng: 82.1409,
    description: 'SECR Railway Headquarters, southern terminal for Anuppur trains'
  }
];

// Helper to compute exact distance in km (Haversine formula * road winding factor 1.28)
export function calculateTripDistance(loc1: LocationItem, loc2: LocationItem): number {
  if (loc1.id === loc2.id) return 2.0;

  const R = 6371; // Earth radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  const roadKm = Math.round(straightLineKm * 1.28 * 10) / 10;
  return Math.max(roadKm, 2.0);
}
