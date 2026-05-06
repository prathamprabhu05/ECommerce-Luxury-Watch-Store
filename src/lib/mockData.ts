import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Royal Oak Offshore Chronograph",
    brand: "Audemars Piguet",
    price: 32500,
    originalPrice: 35000,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600",
    description: "The Royal Oak Offshore is a bold and sporty interpretation of the iconic Royal Oak design. Featuring a distinctive octagonal bezel and 'Tapisserie' dial pattern.",
    badge: "NEW",
    rating: 4.9,
    reviews: 128,
    stock: 5,
    specs: {
      movement: "Automatic Chronograph",
      caseMaterial: "Stainless Steel",
      caseSize: "42mm",
      waterResistance: "100m",
      strapMaterial: "Rubber Strap",
      warranty: "5 Years"
    }
  },
  {
    id: 2,
    name: "Seamaster Diver 300M",
    brand: "Omega",
    price: 5200,
    image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600",
    description: "Professional dive watch with Co-Axial Master Chronometer movement. Water resistant to 300 meters with helium escape valve and ceramic bezel.",
    badge: "BESTSELLER",
    rating: 4.8,
    reviews: 342,
    stock: 12,
    specs: {
      movement: "Co-Axial Master Chronometer",
      caseMaterial: "Stainless Steel",
      caseSize: "42mm",
      waterResistance: "300m",
      strapMaterial: "Steel Bracelet",
      warranty: "5 Years"
    }
  },
  {
    id: 3,
    name: "Submariner Date",
    brand: "Rolex",
    price: 14300,
    image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=600",
    description: "The reference among divers' watches. Waterproof to 300 metres with Rolex's iconic Oyster case and Cerachrom bezel insert.",
    rating: 5.0,
    reviews: 567,
    stock: 3,
    specs: {
      movement: "Perpetual Automatic",
      caseMaterial: "Oystersteel",
      caseSize: "41mm",
      waterResistance: "300m",
      strapMaterial: "Oyster Bracelet",
      warranty: "5 Years"
    }
  },
  {
    id: 4,
    name: "Navitimer B01 Chronograph",
    brand: "Breitling",
    price: 8950,
    originalPrice: 9500,
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600",
    description: "Iconic pilot's chronograph with circular slide rule. Features in-house Manufacture Caliber 01 movement with 70-hour power reserve.",
    badge: "LIMITED",
    rating: 4.7,
    reviews: 89,
    stock: 1,
    specs: {
      movement: "Manufacture Caliber 01",
      caseMaterial: "Stainless Steel",
      caseSize: "43mm",
      waterResistance: "30m",
      strapMaterial: "Leather Strap",
      warranty: "2 Years"
    }
  },
  {
    id: 5,
    name: "Speedmaster Moonwatch Professional",
    brand: "Omega",
    price: 6500,
    image: "https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=600",
    description: "The legendary Moonwatch. First watch worn on the moon, featuring manual-wound chronograph movement with hesalite crystal.",
    badge: "BESTSELLER",
    rating: 4.9,
    reviews: 453,
    stock: 8,
    specs: {
      movement: "Manual-Wound Chronograph",
      caseMaterial: "Stainless Steel",
      caseSize: "42mm",
      waterResistance: "50m",
      strapMaterial: "Steel Bracelet",
      warranty: "5 Years"
    }
  },
  {
    id: 6,
    name: "Cosmograph Daytona",
    brand: "Rolex",
    price: 28500,
    image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600",
    description: "The ultimate chronograph, designed for professional racing drivers. Features an engraved tachymetric scale and Superlative Chronometer certification.",
    badge: "NEW",
    rating: 5.0,
    reviews: 712,
    stock: 2,
    specs: {
      movement: "Perpetual Chronograph",
      caseMaterial: "Oystersteel",
      caseSize: "40mm",
      waterResistance: "100m",
      strapMaterial: "Oyster Bracelet",
      warranty: "5 Years"
    }
  },
  {
    id: 7,
    name: "Big Bang Unico Titanium",
    brand: "Hublot",
    price: 18400,
    originalPrice: 19500,
    image: "https://images.unsplash.com/photo-1533139501568-316c4e20e56e?w=600",
    description: "Bold fusion design with in-house UNICO flyback chronograph movement. Skeleton dial showcasing the intricate chronograph mechanism.",
    rating: 4.6,
    reviews: 156,
    stock: 6,
    specs: {
      movement: "HUB1242 UNICO",
      caseMaterial: "Titanium",
      caseSize: "45mm",
      waterResistance: "100m",
      strapMaterial: "Rubber Strap",
      warranty: "3 Years"
    }
  },
  {
    id: 8,
    name: "Patrimony Manual-Winding",
    brand: "Vacheron Constantin",
    price: 23800,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
    description: "Elegant dress watch with ultra-thin movement. Refined aesthetics embodying traditional Swiss craftsmanship and timeless design.",
    badge: "LIMITED",
    rating: 4.8,
    reviews: 67,
    stock: 4,
    specs: {
      movement: "Ultra-Thin Manual",
      caseMaterial: "18K White Gold",
      caseSize: "40mm",
      waterResistance: "30m",
      strapMaterial: "Alligator Leather",
      warranty: "3 Years"
    }
  },
  {
    id: 9,
    name: "Aquanaut Travel Time",
    brand: "Patek Philippe",
    price: 21650,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600",
    description: "Modern sports watch with embossed checkerboard dial. Dual timezone functionality with water-resistant tropical composite strap.",
    rating: 4.9,
    reviews: 234,
    stock: 7,
    specs: {
      movement: "Self-Winding Mechanical",
      caseMaterial: "Stainless Steel",
      caseSize: "40mm",
      waterResistance: "120m",
      strapMaterial: "Composite Strap",
      warranty: "2 Years"
    }
  },
  {
    id: 10,
    name: "Portugieser Chronograph",
    brand: "IWC Schaffhausen",
    price: 9950,
    originalPrice: 10500,
    image: "https://images.unsplash.com/photo-1509941943102-10c232535736?w=600",
    description: "Classic chronograph with distinctive railway track minute circle. In-house manufactured movement with 68-hour power reserve.",
    badge: "NEW",
    rating: 4.7,
    reviews: 178,
    stock: 10,
    specs: {
      movement: "IWC-Manufactured 69355",
      caseMaterial: "Stainless Steel",
      caseSize: "41mm",
      waterResistance: "30m",
      strapMaterial: "Alligator Leather",
      warranty: "2 Years"
    }
  },
  {
    id: 11,
    name: "Tank Must de Cartier",
    brand: "Cartier",
    price: 3500,
    image: "https://images.unsplash.com/photo-1594534475735-f7bbfd5276ad?w=600",
    description: "Iconic rectangular case with Roman numerals. Art Deco inspired design with signature blue synthetic spinel crown.",
    badge: "BESTSELLER",
    rating: 4.8,
    reviews: 389,
    stock: 15,
    specs: {
      movement: "Quartz",
      caseMaterial: "Stainless Steel",
      caseSize: "33.7 x 25.5mm",
      waterResistance: "30m",
      strapMaterial: "Leather Strap",
      warranty: "2 Years"
    }
  },
  {
    id: 12,
    name: "El Primero Chronomaster",
    brand: "Zenith",
    price: 7900,
    image: "https://images.unsplash.com/photo-1595246140406-b5a4c6f25cca?w=600",
    description: "High-frequency chronograph movement beating at 36,000 vibrations per hour. Tri-color sub-dials for ultimate precision timing.",
    rating: 4.6,
    reviews: 145,
    stock: 9,
    specs: {
      movement: "El Primero 400",
      caseMaterial: "Stainless Steel",
      caseSize: "42mm",
      waterResistance: "100m",
      strapMaterial: "Leather Strap",
      warranty: "2 Years"
    }
  },
  {
    id: 13,
    name: "Luminor Marina PAM01312",
    brand: "Panerai",
    price: 8200,
    originalPrice: 8800,
    image: "https://images.unsplash.com/photo-1601736998023-b56d6219f1e3?w=600",
    description: "Distinctive cushion-shaped case with patented crown protection device. Military heritage design with 3-day power reserve.",
    badge: "LIMITED",
    rating: 4.7,
    reviews: 112,
    stock: 5,
    specs: {
      movement: "Automatic P.9010",
      caseMaterial: "Brushed Steel",
      caseSize: "44mm",
      waterResistance: "300m",
      strapMaterial: "Leather Strap",
      warranty: "8 Years"
    }
  },
  {
    id: 14,
    name: "Classic Fusion Titanium",
    brand: "Hublot",
    price: 6400,
    image: "https://images.unsplash.com/photo-1606390288921-d877d2afb9ba?w=600",
    description: "Refined interpretation of the fusion concept. Slim profile with elegant proportions and scratch-resistant titanium case.",
    rating: 4.5,
    reviews: 98,
    stock: 11,
    specs: {
      movement: "HUB1100 Automatic",
      caseMaterial: "Titanium",
      caseSize: "42mm",
      waterResistance: "50m",
      strapMaterial: "Alligator Leather",
      warranty: "3 Years"
    }
  },
  {
    id: 15,
    name: "Carrera Calibre Heuer 02",
    brand: "TAG Heuer",
    price: 5500,
    image: "https://images.unsplash.com/photo-1617626831706-77019b444088?w=600",
    description: "Racing-inspired chronograph with heritage design. Modern interpretation of the classic Carrera with in-house movement.",
    badge: "BESTSELLER",
    rating: 4.6,
    reviews: 267,
    stock: 13,
    specs: {
      movement: "Calibre Heuer 02",
      caseMaterial: "Stainless Steel",
      caseSize: "44mm",
      waterResistance: "100m",
      strapMaterial: "Steel Bracelet",
      warranty: "2 Years"
    }
  },
  {
    id: 16,
    name: "Oyster Perpetual 41",
    brand: "Rolex",
    price: 6150,
    image: "https://images.unsplash.com/photo-1569411032431-07598b0012c2?w=600",
    description: "The purest expression of the Oyster concept. Simple three-hand watch with vibrant dial colors and exceptional reliability.",
    rating: 4.8,
    reviews: 445,
    stock: 0,
    specs: {
      movement: "Perpetual 3230",
      caseMaterial: "Oystersteel",
      caseSize: "41mm",
      waterResistance: "100m",
      strapMaterial: "Oyster Bracelet",
      warranty: "5 Years"
    }
  },
  {
    id: 17,
    name: "Grand Seiko Spring Drive SBGA211",
    brand: "Grand Seiko",
    price: 7800,
    originalPrice: 8200,
    image: "https://images.unsplash.com/photo-1639006570490-79c0c53f1080?w=600",
    description: "Unique Spring Drive movement combining mechanical and quartz precision. Smooth gliding seconds hand with iconic 'Snowflake' dial.",
    badge: "NEW",
    rating: 4.9,
    reviews: 134,
    stock: 6,
    specs: {
      movement: "Spring Drive 9R65",
      caseMaterial: "Stainless Steel",
      caseSize: "41mm",
      waterResistance: "100m",
      strapMaterial: "Steel Bracelet",
      warranty: "3 Years"
    }
  },
  {
    id: 18,
    name: "De Ville Prestige Co-Axial",
    brand: "Omega",
    price: 4850,
    image: "https://images.unsplash.com/photo-1611003228941-98852ba62227?w=600",
    description: "Classic dress watch with refined elegance. Co-Axial escapement for superior precision and reduced servicing requirements.",
    rating: 4.7,
    reviews: 189,
    stock: 14,
    specs: {
      movement: "Co-Axial 2500",
      caseMaterial: "Stainless Steel",
      caseSize: "39.5mm",
      waterResistance: "30m",
      strapMaterial: "Leather Strap",
      warranty: "5 Years"
    }
  },
  {
    id: 19,
    name: "Monaco Calibre 11",
    brand: "TAG Heuer",
    price: 6900,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600",
    description: "Iconic square chronograph made famous by Steve McQueen. Bold racing heritage design with automatic chronograph movement.",
    badge: "LIMITED",
    rating: 4.8,
    reviews: 156,
    stock: 1,
    specs: {
      movement: "Calibre 11 Automatic",
      caseMaterial: "Stainless Steel",
      caseSize: "39mm",
      waterResistance: "100m",
      strapMaterial: "Leather Strap",
      warranty: "2 Years"
    }
  },
  {
    id: 20,
    name: "Overseas Dual Time",
    brand: "Vacheron Constantin",
    price: 27700,
    image: "https://images.unsplash.com/photo-1565440962783-f87efdea99fd?w=600",
    description: "Sophisticated sports watch with interchangeable strap system. Maltese cross-inspired bezel and dual timezone functionality.",
    rating: 4.9,
    reviews: 87,
    stock: 3,
    specs: {
      movement: "Automatic 5110 DT",
      caseMaterial: "Stainless Steel",
      caseSize: "41mm",
      waterResistance: "150m",
      strapMaterial: "Steel Bracelet",
      warranty: "3 Years"
    }
  }
];
