/**
 * SahyogSeva - Extensible Multi-Service Registry
 * 
 * To add a new service or trade category to SahyogSeva, simply add an entry
 * to the `SERVICES_CATALOG` below. The UI Category Chips, Search Filter,
 * and Worker Matching will automatically recognize it.
 */

export type ServiceCategoryKey =
  | 'ALL'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'APPLIANCE'
  | 'CARPENTRY'
  | 'CLEANING'
  | 'PAINTING'
  | 'PEST_GARDENING';

export interface ServiceCategoryMeta {
  key: ServiceCategoryKey;
  labelEn: string;
  labelHi: string;
  iconName: string; // Lucide icon name
  badgeColor: string;
}

export interface ServiceItem {
  id: string;
  category: ServiceCategoryKey;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  baseRate: number; // in INR
  durationEst: string;
  isPopular?: boolean;
  searchKeywords: string[];
}

export const SERVICE_CATEGORIES: ServiceCategoryMeta[] = [
  {
    key: 'ALL',
    labelEn: 'All Services',
    labelHi: 'सभी सेवाएं',
    iconName: 'LayoutGrid',
    badgeColor: 'emerald',
  },
  {
    key: 'ELECTRICAL',
    labelEn: 'Electrician',
    labelHi: 'इलेक्ट्रीशियन',
    iconName: 'Zap',
    badgeColor: 'amber',
  },
  {
    key: 'PLUMBING',
    labelEn: 'Plumber',
    labelHi: 'प्लंबर',
    iconName: 'Droplets',
    badgeColor: 'sky',
  },
  {
    key: 'APPLIANCE',
    labelEn: 'Appliance Repair',
    labelHi: 'उपकरण मरम्मत',
    iconName: 'Cpu',
    badgeColor: 'indigo',
  },
  {
    key: 'CARPENTRY',
    labelEn: 'Carpenter',
    labelHi: 'बढ़ई / कारपेंटर',
    iconName: 'Hammer',
    badgeColor: 'orange',
  },
  {
    key: 'CLEANING',
    labelEn: 'Cleaning',
    labelHi: 'सफाई सेवा',
    iconName: 'Sparkles',
    badgeColor: 'teal',
  },
  {
    key: 'PAINTING',
    labelEn: 'Painting & Putty',
    labelHi: 'पेंटिंग एवं पुट्टी',
    iconName: 'Paintbrush',
    badgeColor: 'purple',
  },
  {
    key: 'PEST_GARDENING',
    labelEn: 'Pest & Garden',
    labelHi: 'कीट नियंत्रण व बागवानी',
    iconName: 'Trees',
    badgeColor: 'lime',
  },
];

export const SERVICES_CATALOG: ServiceItem[] = [
  // 1. Electrical
  {
    id: 'srv-elec-1',
    category: 'ELECTRICAL',
    nameEn: 'Master Electrician Diagnostics & Wiring',
    nameHi: 'मास्टर इलेक्ट्रीशियन वायरिंग व जांच',
    descriptionEn: 'Short-circuit check, circuit breaker/MCB repair, whole-house diagnostics',
    descriptionHi: 'शॉर्ट सर्किट जांच, एमसीबी व घरेलू विद्युत जांच',
    baseRate: 299,
    durationEst: '45 mins',
    isPopular: true,
    searchKeywords: ['electrician', 'wiring', 'mcb', 'switch', 'inverter', 'earthing', 'power', 'fuse'],
  },
  {
    id: 'srv-elec-2',
    category: 'ELECTRICAL',
    nameEn: 'Inverter & Earthing Installation',
    nameHi: 'इन्वर्टर एवं अर्थिंग फिटिंग',
    descriptionEn: 'Heavy load inverter setup, battery water check, chemical earthing',
    descriptionHi: 'इन्वर्टर सेटअप व केमिकल अर्थिंग इंस्टॉलेशन',
    baseRate: 449,
    durationEst: '60 mins',
    isPopular: false,
    searchKeywords: ['inverter', 'battery', 'earthing', 'power backup', 'generator'],
  },
  {
    id: 'srv-elec-3',
    category: 'ELECTRICAL',
    nameEn: 'Smart Switch & Sensor Installation',
    nameHi: 'स्मार्ट स्विच एवं सेंसर फिटिंग',
    descriptionEn: 'Modular switches, WiFi automation switches, motion sensor lights',
    descriptionHi: 'मॉड्यूलर स्विच, वाई-फाई स्मार्ट स्विच व मोशन सेंसर',
    baseRate: 349,
    durationEst: '30 mins',
    isPopular: true,
    searchKeywords: ['smart switch', 'automation', 'wifi switch', 'sensor light', 'led'],
  },

  // 2. Plumbing
  {
    id: 'srv-plumb-1',
    category: 'PLUMBING',
    nameEn: 'Pipe Leakage & Tap Repair',
    nameHi: 'पाइप लीकेज एवं नल मरम्मत',
    descriptionEn: 'Concealed pipe leakage detection, tap cartridge replacement, washbasin drain fix',
    descriptionHi: 'पाइप रिसाव जांच, नल बदलना एवं वॉशबेसिन ड्रेन मरम्मत',
    baseRate: 249,
    durationEst: '45 mins',
    isPopular: true,
    searchKeywords: ['plumber', 'pipe', 'leak', 'tap', 'washbasin', 'drain', 'water', 'fitting'],
  },
  {
    id: 'srv-plumb-2',
    category: 'PLUMBING',
    nameEn: 'Water Tank & Motor Pump Service',
    nameHi: 'पानी की टंकी एवं मोटर पंप मरम्मत',
    descriptionEn: 'Submersible motor check, pressure pump installation, tank float valve fix',
    descriptionHi: 'सबमर्सिबल मोटर, प्रेशर पंप व ऑटो-कट फ्लोट वॉल्व',
    baseRate: 399,
    durationEst: '60 mins',
    isPopular: false,
    searchKeywords: ['motor', 'pump', 'water tank', 'submersible', 'float valve', 'pressure pump'],
  },

  // 3. Appliance Repair
  {
    id: 'srv-app-1',
    category: 'APPLIANCE',
    nameEn: 'AC Service & Gas Charging',
    nameHi: 'एसी सर्विस व गैस चार्जिंग',
    descriptionEn: 'Split/Window AC foam jet cleaning, cooling coil check, refrigerant top-up',
    descriptionHi: 'एसी जेट वॉश सर्विस, कूलिंग कॉइल चेक एवं गैस टॉप-अप',
    baseRate: 499,
    durationEst: '60 mins',
    isPopular: true,
    searchKeywords: ['ac', 'air conditioner', 'gas filling', 'cooling', 'jet wash', 'split ac'],
  },
  {
    id: 'srv-app-2',
    category: 'APPLIANCE',
    nameEn: 'Geyser & Water Heater Repair',
    nameHi: 'गीजर एवं वाटर हीटर मरम्मत',
    descriptionEn: 'Thermostat replacement, heating element fix, instant geyser installation',
    descriptionHi: 'गीजर एलिमेंट बदलाव, थर्मोस्टेट रिपेयर व इंस्टॉलेशन',
    baseRate: 299,
    durationEst: '45 mins',
    isPopular: true,
    searchKeywords: ['geyser', 'water heater', 'element', 'thermostat', 'hot water'],
  },
  {
    id: 'srv-app-3',
    category: 'APPLIANCE',
    nameEn: 'Washing Machine & Refrigerator Repair',
    nameHi: 'वाशिंग मशीन एवं फ्रिज मरम्मत',
    descriptionEn: 'Spin/drum issue, PCB repair, compressor relay check, defrosting fixes',
    descriptionHi: 'ड्रम प्रॉब्लम, पीसीबी रिपेयर व कंप्रेसर रिले जांच',
    baseRate: 349,
    durationEst: '60 mins',
    isPopular: false,
    searchKeywords: ['washing machine', 'fridge', 'refrigerator', 'compressor', 'pcb', 'drum'],
  },

  // 4. Carpentry
  {
    id: 'srv-carp-1',
    category: 'CARPENTRY',
    nameEn: 'Door Lock, Hinges & Handle Fix',
    nameHi: 'दरवाजे का ताला, कब्जे व हैंडल मरम्मत',
    descriptionEn: 'Mortise lock fitting, squeaking hinge repair, sliding door alignment',
    descriptionHi: 'लॉक फिटिंग, कब्ज़ा बदलना व स्लाइडिंग डोर अलाइनमेंट',
    baseRate: 249,
    durationEst: '30 mins',
    isPopular: true,
    searchKeywords: ['carpenter', 'lock', 'door', 'handle', 'hinge', 'sliding door', 'wood'],
  },
  {
    id: 'srv-carp-2',
    category: 'CARPENTRY',
    nameEn: 'Furniture Assembly & Repair',
    nameHi: 'फर्नीचर असेंबली व रिपेयर',
    descriptionEn: 'Bed, wardrobe, bookshelf assembly, wooden dining chair tightening',
    descriptionHi: 'बेड, अलमारी, टेबल असेंबली व चेयर मरम्मत',
    baseRate: 399,
    durationEst: '90 mins',
    isPopular: false,
    searchKeywords: ['furniture', 'bed', 'wardrobe', 'table', 'sofa repair', 'woodwork'],
  },

  // 5. Cleaning & Housekeeping
  {
    id: 'srv-clean-1',
    category: 'CLEANING',
    nameEn: 'Deep Kitchen & Bathroom Cleaning',
    nameHi: 'रसोई व बाथरूम डीप क्लीनिंग',
    descriptionEn: 'Tile descaling, exhaust degreasing, sanitaryware sanitization',
    descriptionHi: 'टाइल स्क्रबिंग, एग्जॉस्ट डीग्रीजिंग व संपूर्ण सैनिटाइजेशन',
    baseRate: 599,
    durationEst: '120 mins',
    isPopular: true,
    searchKeywords: ['cleaning', 'kitchen cleaning', 'bathroom cleaning', 'deep clean', 'tiles', 'sanitization'],
  },
  {
    id: 'srv-clean-2',
    category: 'CLEANING',
    nameEn: 'Sofa & Carpet Shampoo Washing',
    nameHi: 'सोफा व कारपेट शैम्पू वॉश',
    descriptionEn: 'Fabric stain extraction, high-pressure vacuuming, fragrance treatment',
    descriptionHi: 'दाग धब्बे हटाना, वैक्यूमिंग व सोफा शैम्पू क्लीनिंग',
    baseRate: 499,
    durationEst: '90 mins',
    isPopular: false,
    searchKeywords: ['sofa', 'carpet', 'shampoo', 'stain', 'vacuum', 'fabric'],
  },

  // 6. Painting & Waterproofing
  {
    id: 'srv-paint-1',
    category: 'PAINTING',
    nameEn: 'Wall Touch-up & Putty Repair',
    nameHi: 'दीवार टच-अप एवं पुट्टी मरम्मत',
    descriptionEn: 'Seepage patch repair, crack filling, single room emulsion coat',
    descriptionHi: 'सीलन रिपेयर, दरारें भरना व एक रूम पेंटिंग',
    baseRate: 699,
    durationEst: '180 mins',
    isPopular: false,
    searchKeywords: ['painting', 'putty', 'seepage', 'wall paint', 'waterproofing', 'primer'],
  },

  // 7. Pest Control & Gardening
  {
    id: 'srv-pest-1',
    category: 'PEST_GARDENING',
    nameEn: 'Herbal Pest & Termite Control',
    nameHi: 'हर्बल कीट व दीमक नियंत्रण',
    descriptionEn: 'Odorless herbal gel baiting for cockroaches, anti-termite wood treatment',
    descriptionHi: 'गंधहीन हर्बल जेल कीट नियंत्रण व दीमक उपचार',
    baseRate: 549,
    durationEst: '60 mins',
    isPopular: true,
    searchKeywords: ['pest control', 'cockroach', 'termite', 'mosquito', 'herbal gel', 'bugs'],
  },
];

/**
 * Filter services by category key
 */
export function getServicesByCategory(category: ServiceCategoryKey): ServiceItem[] {
  if (category === 'ALL') return SERVICES_CATALOG;
  return SERVICES_CATALOG.filter((s) => s.category === category);
}

/**
 * Search services by text
 */
export function searchServices(query: string): ServiceItem[] {
  const clean = query.toLowerCase().trim();
  if (!clean) return SERVICES_CATALOG;
  return SERVICES_CATALOG.filter(
    (s) =>
      s.nameEn.toLowerCase().includes(clean) ||
      s.nameHi.includes(clean) ||
      s.descriptionEn.toLowerCase().includes(clean) ||
      s.searchKeywords.some((kw) => kw.toLowerCase().includes(clean))
  );
}
