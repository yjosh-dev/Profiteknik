export type PhRegion = {
  code: string;
  name: string;
  cities: string[];
};

// Raw data: every region with its cities (incl. Pateros, the lone NCR municipality).
const RAW_REGIONS: PhRegion[] = [
  {
    code: "NCR",
    name: "National Capital Region (NCR)",
    cities: [
      "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong", "Manila",
      "Marikina", "Muntinlupa", "Navotas", "Parañaque", "Pasay", "Pasig",
      "Pateros", "Quezon City", "San Juan", "Taguig", "Valenzuela",
    ],
  },
  {
    code: "CAR",
    name: "Cordillera Administrative Region (CAR)",
    cities: ["Baguio", "Tabuk"],
  },
  {
    code: "I",
    name: "Ilocos Region (Region I)",
    cities: [
      "Alaminos", "Batac", "Candon", "Dagupan", "Laoag", "San Carlos",
      "San Fernando", "Urdaneta", "Vigan",
    ],
  },
  {
    code: "II",
    name: "Cagayan Valley (Region II)",
    cities: ["Cauayan", "Ilagan", "Santiago", "Tuguegarao"],
  },
  {
    code: "III",
    name: "Central Luzon (Region III)",
    cities: [
      "Angeles", "Balanga", "Cabanatuan", "Gapan", "Mabalacat", "Malolos",
      "Meycauayan", "Muñoz", "Olongapo", "Palayan", "San Fernando",
      "San Jose", "San Jose del Monte", "Tarlac City",
    ],
  },
  {
    code: "IV-A",
    name: "CALABARZON (Region IV-A)",
    cities: [
      "Antipolo", "Bacoor", "Batangas City", "Biñan", "Cabuyao", "Calaca",
      "Calamba", "Carmona", "Cavite City", "Dasmariñas", "General Trias",
      "Imus", "Lipa", "Lucena", "San Pablo", "San Pedro", "Santa Rosa",
      "Santo Tomas", "Tagaytay", "Tanauan", "Tayabas", "Trece Martires",
    ],
  },
  {
    code: "IV-B",
    name: "MIMAROPA (Region IV-B)",
    cities: ["Calapan", "Puerto Princesa"],
  },
  {
    code: "V",
    name: "Bicol Region (Region V)",
    cities: [
      "Iriga", "Legazpi", "Ligao", "Masbate City", "Naga", "Sorsogon City",
      "Tabaco",
    ],
  },
  {
    code: "VI",
    name: "Western Visayas (Region VI)",
    cities: [
      "Bacolod", "Bago", "Cadiz", "Escalante", "Himamaylan", "Iloilo City",
      "Kabankalan", "La Carlota", "Passi", "Roxas", "Sagay", "San Carlos",
      "Silay", "Sipalay", "Talisay", "Victorias",
    ],
  },
  {
    code: "VII",
    name: "Central Visayas (Region VII)",
    cities: [
      "Bais", "Bayawan", "Bogo", "Canlaon", "Carcar", "Cebu City", "Danao",
      "Dumaguete", "Guihulngan", "Lapu-Lapu", "Mandaue", "Naga", "Tagbilaran",
      "Talisay", "Tanjay", "Toledo",
    ],
  },
  {
    code: "VIII",
    name: "Eastern Visayas (Region VIII)",
    cities: [
      "Baybay", "Borongan", "Calbayog", "Catbalogan", "Maasin", "Ormoc",
      "Tacloban",
    ],
  },
  {
    code: "IX",
    name: "Zamboanga Peninsula (Region IX)",
    cities: ["Dapitan", "Dipolog", "Isabela City", "Pagadian", "Zamboanga City"],
  },
  {
    code: "X",
    name: "Northern Mindanao (Region X)",
    cities: [
      "Cagayan de Oro", "El Salvador", "Gingoog", "Iligan", "Malaybalay",
      "Oroquieta", "Ozamiz", "Tangub", "Valencia",
    ],
  },
  {
    code: "XI",
    name: "Davao Region (Region XI)",
    cities: ["Davao City", "Digos", "Mati", "Panabo", "Samal", "Tagum"],
  },
  {
    code: "XII",
    name: "SOCCSKSARGEN (Region XII)",
    cities: ["General Santos", "Kidapawan", "Koronadal", "Tacurong"],
  },
  {
    code: "XIII",
    name: "Caraga (Region XIII)",
    cities: [
      "Bayugan", "Bislig", "Butuan", "Cabadbaran", "Surigao City", "Tandag",
    ],
  },
  {
    code: "BARMM",
    name: "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
    cities: ["Cotabato City", "Lamitan", "Marawi"],
  },
];

const byText = (a: string, b: string) => a.localeCompare(b, "en");

// Regions sorted A–Z by name, each with its cities sorted A–Z
export const PH_REGIONS: PhRegion[] = [...RAW_REGIONS]
  .sort((a, b) => byText(a.name, b.name))
  .map((r) => ({ ...r, cities: [...r.cities].sort(byText) }));

// Just the region names (sorted) for the Region dropdown
export const PH_REGION_NAMES: string[] = PH_REGIONS.map((r) => r.name);

// Region name -> sorted cities, for the dependent City dropdown
export const PH_CITIES_BY_REGION: Record<string, string[]> = Object.fromEntries(
  PH_REGIONS.map((r) => [r.name, r.cities])
);

// Handy lookup; returns [] if the region is empty/unknown
export const getCitiesByRegion = (region: string): string[] =>
  PH_CITIES_BY_REGION[region] ?? [];