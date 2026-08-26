/**
 * SahyogSeva - Extensible Multi-Service Registry
 * 
 * To add a new service or trade category to SahyogSeva, simply add an entry
 * to the `SERVICES_CATALOG` below. The UI Category Chips, Search Filter,
 * Problem Selection Wizard, and Worker Matching will automatically recognize it.
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
  labelKey: string;
  labelEn: string;
  labelHi: string;
  iconName: string; // Lucide icon name
  badgeColor: string;
}

export interface ServiceProblemOption {
  id: string;
  labelKey: string;
  price: number; // Task price in INR
  requiresDetails?: boolean;
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
  problemOptions: ServiceProblemOption[];
}

export const SERVICE_CATEGORIES: ServiceCategoryMeta[] = [
  {
    key: 'ALL',
    labelKey: 'services.allServices',
    labelEn: 'All Services',
    labelHi: 'सभी सेवाएं',
    iconName: 'LayoutGrid',
    badgeColor: 'emerald',
  },
  {
    key: 'ELECTRICAL',
    labelKey: 'services.electrician',
    labelEn: 'Electrician',
    labelHi: 'इलेक्ट्रीशियन',
    iconName: 'Zap',
    badgeColor: 'amber',
  },
  {
    key: 'PLUMBING',
    labelKey: 'services.plumber',
    labelEn: 'Plumber',
    labelHi: 'प्लंबर',
    iconName: 'Droplets',
    badgeColor: 'sky',
  },
  {
    key: 'APPLIANCE',
    labelKey: 'services.applianceRepair',
    labelEn: 'Appliance Repair',
    labelHi: 'उपकरण मरम्मत',
    iconName: 'Cpu',
    badgeColor: 'indigo',
  },
  {
    key: 'CARPENTRY',
    labelKey: 'services.carpenter',
    labelEn: 'Carpenter',
    labelHi: 'बढ़ई / कारपेंटर',
    iconName: 'Hammer',
    badgeColor: 'orange',
  },
  {
    key: 'CLEANING',
    labelKey: 'services.cleaning',
    labelEn: 'Cleaning',
    labelHi: 'सफाई सेवा',
    iconName: 'Sparkles',
    badgeColor: 'teal',
  },
  {
    key: 'PAINTING',
    labelKey: 'services.painting',
    labelEn: 'Painting & Putty',
    labelHi: 'पेंटिंग एवं पुट्टी',
    iconName: 'Paintbrush',
    badgeColor: 'purple',
  },
  {
    key: 'PEST_GARDENING',
    labelKey: 'services.pestGarden',
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
    problemOptions: [
      { id: 'mcb_tripping', labelKey: 'services.problems.mcbTripping', price: 299 },
      { id: 'short_circuit', labelKey: 'services.problems.shortCircuit', price: 349 },
      { id: 'wiring_sparking', labelKey: 'services.problems.wiringSparking', price: 279 },
      { id: 'socket_switch_fault', labelKey: 'services.problems.socketSwitchFault', price: 199 },
      { id: 'power_fluctuation', labelKey: 'services.problems.powerFluctuation', price: 249 },
      { id: 'other', labelKey: 'services.problems.other', price: 299, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'inverter_not_charging', labelKey: 'services.problems.inverterNotCharging', price: 399 },
      { id: 'battery_backup_low', labelKey: 'services.problems.batteryBackupLow', price: 349 },
      { id: 'earthing_shock_leakage', labelKey: 'services.problems.earthingShockLeakage', price: 449 },
      { id: 'new_inverter_setup', labelKey: 'services.problems.newInverterSetup', price: 499 },
      { id: 'other', labelKey: 'services.problems.other', price: 449, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'wifi_switch_offline', labelKey: 'services.problems.wifiSwitchOffline', price: 299 },
      { id: 'sensor_light_malfunction', labelKey: 'services.problems.sensorLightMalfunction', price: 349 },
      { id: 'modular_switch_fitting', labelKey: 'services.problems.modularSwitchFitting', price: 249 },
      { id: 'smart_dimmer_issue', labelKey: 'services.problems.smartDimmerIssue', price: 279 },
      { id: 'other', labelKey: 'services.problems.other', price: 349, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'concealed_pipe_leak', labelKey: 'services.problems.concealedPipeLeak', price: 349 },
      { id: 'dripping_tap_cartridge', labelKey: 'services.problems.drippingTapCartridge', price: 199 },
      { id: 'washbasin_drain_block', labelKey: 'services.problems.washbasinDrainBlock', price: 249 },
      { id: 'low_water_pressure', labelKey: 'services.problems.lowWaterPressure', price: 229 },
      { id: 'other', labelKey: 'services.problems.other', price: 249, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'motor_not_starting', labelKey: 'services.problems.motorNotStarting', price: 399 },
      { id: 'tank_overflow_float_valve', labelKey: 'services.problems.tankOverflowFloatValve', price: 299 },
      { id: 'pressure_pump_failure', labelKey: 'services.problems.pressurePumpFailure', price: 449 },
      { id: 'pipeline_airlock', labelKey: 'services.problems.pipelineAirlock', price: 279 },
      { id: 'other', labelKey: 'services.problems.other', price: 399, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'ac_not_cooling', labelKey: 'services.problems.acNotCooling', price: 449 },
      { id: 'water_leakage_indoor', labelKey: 'services.problems.waterLeakageIndoor', price: 349 },
      { id: 'gas_refill_needed', labelKey: 'services.problems.gasRefillNeeded', price: 699 },
      { id: 'foul_smell_filter_dirty', labelKey: 'services.problems.foulSmellFilterDirty', price: 399 },
      { id: 'other', labelKey: 'services.problems.other', price: 499, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'water_not_heating', labelKey: 'services.problems.waterNotHeating', price: 299 },
      { id: 'geyser_tripping_mcb', labelKey: 'services.problems.geyserTrippingMcb', price: 349 },
      { id: 'tank_leakage', labelKey: 'services.problems.tankLeakage', price: 399 },
      { id: 'thermostat_defect', labelKey: 'services.problems.thermostatDefect', price: 279 },
      { id: 'other', labelKey: 'services.problems.other', price: 299, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'wm_drum_not_spinning', labelKey: 'services.problems.wmDrumNotSpinning', price: 349 },
      { id: 'wm_water_drain_error', labelKey: 'services.problems.wmWaterDrainError', price: 299 },
      { id: 'fridge_freezer_not_cooling', labelKey: 'services.problems.fridgeFreezerNotCooling', price: 399 },
      { id: 'fridge_excessive_frost', labelKey: 'services.problems.fridgeExcessiveFrost', price: 299 },
      { id: 'other', labelKey: 'services.problems.other', price: 349, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'lock_jammed_broken', labelKey: 'services.problems.lockJammedBroken', price: 249 },
      { id: 'squeaking_loose_hinges', labelKey: 'services.problems.squeakingLooseHinges', price: 199 },
      { id: 'sliding_door_off_track', labelKey: 'services.problems.slidingDoorOffTrack', price: 299 },
      { id: 'door_not_closing_aligned', labelKey: 'services.problems.doorNotClosingAligned', price: 249 },
      { id: 'other', labelKey: 'services.problems.other', price: 249, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'bed_wardrobe_assembly', labelKey: 'services.problems.bedWardrobeAssembly', price: 449 },
      { id: 'table_chair_wobbling', labelKey: 'services.problems.tableChairWobbling', price: 299 },
      { id: 'drawer_channel_damaged', labelKey: 'services.problems.drawerChannelDamaged', price: 349 },
      { id: 'wooden_polishing_needed', labelKey: 'services.problems.woodenPolishingNeeded', price: 399 },
      { id: 'other', labelKey: 'services.problems.other', price: 399, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'kitchen_oil_grease_removal', labelKey: 'services.problems.kitchenOilGreaseRemoval', price: 499 },
      { id: 'bathroom_hardwater_stains', labelKey: 'services.problems.bathroomHardwaterStains', price: 399 },
      { id: 'tile_grout_discoloration', labelKey: 'services.problems.tileGroutDiscoloration', price: 349 },
      { id: 'exhaust_fan_degreasing', labelKey: 'services.problems.exhaustFanDegreasing', price: 299 },
      { id: 'other', labelKey: 'services.problems.other', price: 599, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'deep_stain_removal', labelKey: 'services.problems.deepStainRemoval', price: 449 },
      { id: 'dust_mite_allergen_vacuum', labelKey: 'services.problems.dustMiteAllergenVacuum', price: 349 },
      { id: 'pet_odor_sanitization', labelKey: 'services.problems.petOdorSanitization', price: 299 },
      { id: 'fabric_color_restoration', labelKey: 'services.problems.fabricColorRestoration', price: 399 },
      { id: 'other', labelKey: 'services.problems.other', price: 499, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'wall_seepage_flaking', labelKey: 'services.problems.wallSeepageFlaking', price: 599 },
      { id: 'plaster_crack_filling', labelKey: 'services.problems.plasterCrackFilling', price: 499 },
      { id: 'nail_hole_patchwork', labelKey: 'services.problems.nailHolePatchwork', price: 299 },
      { id: 'single_wall_color_coat', labelKey: 'services.problems.singleWallColorCoat', price: 699 },
      { id: 'other', labelKey: 'services.problems.other', price: 699, requiresDetails: true },
    ],
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
    problemOptions: [
      { id: 'cockroach_infestation', labelKey: 'services.problems.cockroachInfestation', price: 499 },
      { id: 'termite_wood_damage', labelKey: 'services.problems.termiteWoodDamage', price: 599 },
      { id: 'bedbug_bite_itching', labelKey: 'services.problems.bedbugBiteItching', price: 549 },
      { id: 'mosquito_ant_control', labelKey: 'services.problems.mosquitoAntControl', price: 399 },
      { id: 'other', labelKey: 'services.problems.other', price: 549, requiresDetails: true },
    ],
  },
];

/**
 * Single source of truth calculation for service request price.
 * Sums selected predefined problem prices.
 * If only 'other' is selected or no tasks selected, uses the service baseRate.
 */
export function calculateServiceRequestPrice(service: ServiceItem, selectedProblemIds: string[]): number {
  if (!selectedProblemIds || selectedProblemIds.length === 0) {
    return service.baseRate;
  }

  const definedProblems = selectedProblemIds.filter((id) => id !== 'other');
  const hasOther = selectedProblemIds.includes('other');

  if (definedProblems.length === 0 && hasOther) {
    return service.baseRate;
  }

  let sum = 0;
  for (const id of definedProblems) {
    const option = service.problemOptions.find((p) => p.id === id);
    if (option && typeof option.price === 'number') {
      sum += option.price;
    } else {
      sum += service.baseRate;
    }
  }

  return sum > 0 ? sum : service.baseRate;
}

/**
 * Filter services by category key
 */
export function getServicesByCategory(category: ServiceCategoryKey): ServiceItem[] {
  if (category === 'ALL') return SERVICES_CATALOG;
  return SERVICES_CATALOG.filter((s) => s.category === category);
}

/**
 * Find service by ID
 */
export function getServiceById(id: string): ServiceItem | undefined {
  return SERVICES_CATALOG.find((s) => s.id === id);
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
