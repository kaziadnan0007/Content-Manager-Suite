import { db } from "@workspace/db";
import {
  adminTable,
  categoriesTable,
  productsTable,
  bannersTable,
  siteSettingsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";
import { logger } from "./lib/logger";

// ── Image triplets per category (front / side-angle / detail) ─────────────
const IMG_BASE = "https://images.unsplash.com/photo-";
const Q = "?w=600&h=600&fit=crop&q=80";
const QS = "?w=600&h=600&fit=crop&q=80&crop=edges";
const QD = "?w=600&h=600&fit=crop&q=80&crop=center";

function tri(a: string, b: string, c: string) {
  return [IMG_BASE + a + Q, IMG_BASE + b + QS, IMG_BASE + c + QD];
}

const CATEGORY_CONFIGS: Record<
  string,
  {
    imageSets: string[][];
    types: string[];
    variants: string[];
    adjectives: string[];
    priceMin: number;
    priceMax: number;
    badges: (string | null)[];
  }
> = {
  electronics: {
    imageSets: [
      tri("1511707171634-5f897ff02aa9", "1592750475338-74b7b21085ab", "1601784551446-a98e1c93b6ec"),
      tri("1496181133206-80ce9b88a853", "1484788984921-03950022c9ef", "1531297484001-80022131f5a1"),
      tri("1590658268037-6bf12165a8df", "1606400082777-ef05f3c5cde2", "1625842268584-8f3296236761"),
      tri("1593784991095-a205069470b6", "1558618666-fcd25c85cd64", "1586881174984-add40f83ed3b"),
      tri("1502920917128-1aa500764cbd", "1516035069371-29a1b244cc32", "1609091839311-d5365f9ff1c5"),
      tri("1544244015-0df4b3ffc6b0", "1527864550417-7fd91fc51a46", "1595225476474-59fc01e48b4c"),
      tri("1608043152269-423dbba4e7e1", "1625910513459-42eba84ab73c", "1611532736597-de2d4265fba3"),
    ],
    types: ["Smartphone", "Laptop", "Tablet", "Earbuds", "Bluetooth Speaker", "Power Bank", "Smart TV", "DSLR Camera", "Gaming Mouse", "Mechanical Keyboard", "USB-C Hub", "Ring Light", "Webcam", "Smart Watch", "Drone"],
    variants: ["Pro", "Max", "Ultra", "Lite", "Plus", "SE", "X", "Z", "Elite", "Prime", "Air", "Mini", "Neo", "Turbo", "Edge"],
    adjectives: ["128GB", "256GB", "512GB", "16GB RAM", "32GB RAM", "4K", "Full HD", "RGB", "Wireless", "5G", "Foldable", "Waterproof", "Gaming", "Portable", "Smart"],
    priceMin: 500,
    priceMax: 85000,
    badges: ["Best Seller", "Hot Deal", "New", "Sale", "Gaming", "Premium", "Popular", null, "Top Pick", "Trending"],
  },
  clothing: {
    imageSets: [
      tri("1610030469983-98e550d6193c", "1594938298603-c8148c4b4466", "1521572163474-6864f9cf17ab"),
      tri("1556821840-3a63f15732ce", "1542272604-787c3835535d", "1567401893-c8c1a58e1a74"),
      tri("1614676471928-2ed0ad1061a4", "1617952739613-f53f7c28f7b7", "1503341338985-c0477be52513"),
      tri("1625910513459-42eba84ab73c", "1507003211169-0a1dd7228f2d", "1591195853828-11db59a44f43"),
      tri("1523381210434-271e8be8a52b", "1434389677669-e08b4cac3105", "1489987707849-dc5b55f9bf32"),
    ],
    types: ["Saree", "Panjabi", "T-Shirt", "Salwar Kameez", "Jeans", "Hoodie", "Kurti", "Kurta Set", "Polo Shirt", "Formal Blazer", "Shorts", "School Shirt", "Tracksuit", "Sherwani", "Lehenga"],
    variants: ["Premium", "Classic", "Designer", "Printed", "Embroidered", "Plain", "Slim Fit", "Regular Fit", "Comfort Fit", "Tailored", "Casual", "Formal", "Ethnic", "Fusion", "Party Wear"],
    adjectives: ["Cotton", "Silk", "Linen", "Georgette", "Polyester", "Rayon", "Chiffon", "Velvet", "Denim", "Jersey", "Muslin", "Voile", "Crepe", "Lawn", "Satin"],
    priceMin: 300,
    priceMax: 12000,
    badges: ["Trending", "Exclusive", "Sale", "Eid Special", "New Arrival", "Best Seller", null, "Top Pick", "Festival", "Limited Edition"],
  },
  beauty: {
    imageSets: [
      tri("1556228578-8c89e6adf883", "1571781926291-c477ebfd024b", "1620916566398-39f1143ab7be"),
      tri("1586495777744-4e6b0a2c5b06", "1541643600914-78b084683702", "1522335789203-aabd1fc54bc9"),
      tri("1512496015851-a90fb38ba796", "1619451334792-150fd785ee74", "1604654894610-df63bc536371"),
      tri("1527799820374-87036c46df5f", "1611703416853-1a7d1b0cd9b0", "1570194065650-d99fb4bedf0a"),
    ],
    types: ["Face Wash", "Moisturizer", "Lipstick", "Perfume", "Serum", "Foundation", "Hair Mask", "Nail Polish", "Sunscreen", "Eyebrow Pencil", "Toner", "Eye Cream", "Body Lotion", "Face Mask", "Blush"],
    variants: ["Brightening", "Hydrating", "Matte", "Glow", "Anti-Aging", "SPF30", "SPF50", "Natural", "Organic", "Vegan", "Whitening", "Nourishing", "Detox", "Repair", "Soothing"],
    adjectives: ["30ml", "50ml", "100ml", "250ml", "Set of 3", "Set of 6", "Set of 12", "Gift Pack", "Travel Size", "Full Size", "Duo Pack", "Trio Set", "Mini Kit", "Luxury", "Pro Formula"],
    priceMin: 200,
    priceMax: 5000,
    badges: ["Popular", "Luxury", "Sale", "Gift", "New", "Best Seller", null, "Organic", "Dermatologist Tested", "Award Winner"],
  },
  "home-appliances": {
    imageSets: [
      tri("1586201375761-83865001e31c", "1570222094114-d054a817e56b", "1544735716-392fe2489ffa"),
      tri("1585771724684-38269d6639fd", "1556679343-c7306c1976bc", "1461023058943-07fcbe16d735"),
      tri("1558618666-fcd25c85cd64", "1555041469-a586c61ea9bc", "1586023492125-27264fee1dce"),
      tri("1571019613454-1cb2f99b2d8b", "1612197340049-bfe5c0c8f4b1", "1534430480872-3498386dfb43"),
    ],
    types: ["Rice Cooker", "Blender", "Vacuum Cleaner", "Air Purifier", "Electric Kettle", "Sandwich Maker", "Steam Iron", "Table Fan", "Microwave Oven", "Juicer", "Coffee Maker", "Toaster Oven", "Water Purifier", "Induction Cooker", "Mixer Grinder"],
    variants: ["Digital", "Smart", "Auto", "Deluxe", "Pro", "Ultra", "Compact", "Heavy Duty", "Energy Saver", "Turbo", "Precision", "Multi-Function", "Cordless", "Silent", "Premium"],
    adjectives: ["750W", "1000W", "1500W", "2000W", "2200W", "2400W", "1L", "1.5L", "1.8L", "3L", "5L", "HEPA Filter", "Non-Stick", "Stainless Steel", "BPA Free"],
    priceMin: 500,
    priceMax: 30000,
    badges: ["Energy Star", "Best Seller", null, "Hot", "Health", "Digital", "New", "Sale", "Popular", "Durable"],
  },
  sports: {
    imageSets: [
      tri("1571019613454-1cb2f99b2d8b", "1534438327276-14e5300c3a48", "1591638246754-93d3e1fbe61f"),
      tri("1517836357463-d25dfeac3438", "1530549387789-6a083cd58455", "1549060279-7e168fcee0c2"),
      tri("1461896836374-cf9bfb3f3b3f", "1576678927484-cc907957088c", "1612872087718-be1edabce68b"),
      tri("1604480133080-602261ef5993", "1597452485676-1917640fce72", "1622163642998-1ea32b0bbc67"),
    ],
    types: ["Dumbbell Set", "Yoga Mat", "Resistance Bands", "Treadmill", "Cycling Helmet", "Football", "Cricket Bat", "Badminton Racket", "Jump Rope", "Gym Gloves", "Knee Support", "Running Shoes", "Tennis Ball Set", "Swimming Goggles", "Pull Up Bar"],
    variants: ["Pro", "Training", "Competition", "Beginner", "Advanced", "Premium", "Lightweight", "Heavy Duty", "Foldable", "Adjustable", "Elite", "Sport", "Champion", "Ultra", "Max"],
    adjectives: ["5kg", "10kg", "20kg", "Anti-Slip", "Non-Toxic", "Waterproof", "Breathable", "Shock Absorbing", "CE Certified", "Professional", "Durable", "Ergonomic", "Portable", "1.5HP", "3HP"],
    priceMin: 200,
    priceMax: 25000,
    badges: ["Gym", "Cardio", "Safety", "Pro", "Bestseller", null, "New", "Competition Grade", "Lightweight", "Top Pick"],
  },
  bags: {
    imageSets: [
      tri("1548036161-18adac46fa35", "1553062407-98eeb64c6a6e", "1566150905458-1bf1a2a5fcfe"),
      tri("1553062407-98eeb64c6a6e", "1548036161-18adac46fa35", "1598532163257-1d533ca7b39c"),
      tri("1590874103328-eac38a683ce7", "1547949003-9792a18a2841", "1576273088095-d7e3d7e2d8e6"),
      tri("1473188637741-f79cc3dfcfbb", "1611532736597-de2d4265fba3", "1581605405669-71af3e02b3a3"),
    ],
    types: ["Backpack", "Tote Bag", "Shoulder Bag", "Handbag", "Laptop Bag", "Travel Bag", "School Bag", "Gym Bag", "Messenger Bag", "Clutch", "Waist Bag", "Camera Bag", "Trolley Bag", "Drawstring Bag", "Duffle Bag"],
    variants: ["Leather", "Canvas", "Nylon", "Waterproof", "Anti-Theft", "Premium", "Casual", "Formal", "Vintage", "Modern", "Urban", "Classic", "Sport", "Designer", "Slim"],
    adjectives: ["15L", "20L", "30L", "40L", "50L", "USB Charging Port", "15.6 inch", "17 inch", "Multi-Pocket", "Padded", "Reflective", "Foldable", "Expandable", "Carry-On", "Trolley Compatible"],
    priceMin: 400,
    priceMax: 8000,
    badges: ["Trending", "Best Seller", "New", null, "Sale", "Premium", "Anti-Theft", "Waterproof", "Popular", "Travel"],
  },
  shoes: {
    imageSets: [
      tri("1542291026-7eec264c27ff", "1491553895911-0055eca6402d", "1533681904393-9ab6eee7bfa4"),
      tri("1606107557195-0e29a4b5b4aa", "1542291026-7eec264c27ff", "1584735175097-6e62b7451aca"),
      tri("1562273138-f46be4ebdf33", "1595950653106-bdbade1a48b8", "1600185365483-26d8a7cd1ea5"),
      tri("1514989771522-458c9b6c035a", "1468854082049-a7f1a59c1e85", "1574623452334-1e0ac2b3ccb4"),
    ],
    types: ["Running Shoes", "Sneakers", "Formal Shoes", "Sandals", "Loafers", "Boots", "Flip Flops", "Sports Shoes", "School Shoes", "Heels", "Wedges", "Mules", "Slippers", "Oxford Shoes", "Ankle Boots"],
    variants: ["Premium", "Comfort", "Ultra Cushion", "Breathable", "Waterproof", "Lightweight", "Anti-Slip", "Memory Foam", "Arch Support", "Wide Fit", "Slim", "Classic", "Sport", "Fashion", "Casual"],
    adjectives: ["Size 38-44", "Genuine Leather", "PU Leather", "Mesh Upper", "Rubber Sole", "EVA Sole", "Anti-Odor", "Shock Absorbing", "Non-Slip", "Air Cushion", "Soft Insole", "Durable", "Flexible", "Grip Sole", "Padded Collar"],
    priceMin: 300,
    priceMax: 6000,
    badges: ["Comfort", "Best Seller", null, "New", "Sale", "Trending", "Sport", "Popular", "Premium", "Top Pick"],
  },
  watches: {
    imageSets: [
      tri("1546868871-7041f2a55e12", "1523275335684-37898b6baf30", "1508685096489-7aacd43bd3b1"),
      tri("1587836374828-4dbafa94cf0e", "1617891046880-6caa6ef5d04d", "1584868072262-b2a4c9a3fe50"),
      tri("1542496658-e33a6d0d1e6b", "1508616221202-b0f0c0568bc6", "1556742049-0cfed4f6a45d"),
    ],
    types: ["Smart Watch", "Analog Watch", "Digital Watch", "Couple Watch", "Ladies Watch", "Mechanical Watch", "Chronograph", "Dive Watch", "Pilot Watch", "Dress Watch"],
    variants: ["Classic", "Sport", "Luxury", "Casual", "Business", "Elegant", "Pro", "Slim", "Bold", "Vintage", "Modern", "Automatic", "Quartz", "Solar", "Hybrid"],
    adjectives: ["Stainless Steel", "Genuine Leather", "Silicone Strap", "Titanium", "Rose Gold", "Black Dial", "White Dial", "Blue Dial", "Sapphire Crystal", "10ATM Waterproof", "50M Water Resistant", "AMOLED Display", "Heart Rate Monitor", "GPS", "Multi-Sport Modes"],
    priceMin: 400,
    priceMax: 15000,
    badges: ["Luxury", "Popular", "Exclusive", "Sale", null, "New Arrival", "Best Seller", "Limited", "Trending", "Gift Idea"],
  },
  kids: {
    imageSets: [
      tri("1515488042361-ee00e0ddd4e4", "1558618666-fcd25c85cd64", "1545558074-1f7c4b89d46e"),
      tri("1515488042361-ee00e0ddd4e4", "1558697585-f3d5a7a5f8e5", "1607453998774-d533f65dac99"),
      tri("1566576912321-d58dbb58cc55", "1553708881-112a574ef4e7", "1596461404969-9ae70f2830c1"),
    ],
    types: ["Building Blocks", "Baby Walker", "Remote Car", "Doll Set", "Puzzle", "Art Kit", "Board Game", "Bicycle", "Scooter", "Stuffed Animal", "Musical Toy", "Science Kit", "Swing Set", "Water Gun", "Toy Kitchen"],
    variants: ["Educational", "Interactive", "Creative", "Classic", "Premium", "Safe", "Colorful", "Electronic", "Wooden", "Soft", "Outdoor", "Indoor", "Multi-Skill", "STEM", "Musical"],
    adjectives: ["Ages 1-3", "Ages 3-6", "Ages 6-12", "Non-Toxic", "BPA Free", "CE Certified", "100pcs", "200pcs", "500pcs", "Battery Operated", "Remote Control", "Foldable", "Multi-Color", "Learning", "Washable"],
    priceMin: 200,
    priceMax: 5000,
    badges: ["STEM", "Safety", "Educational", "Popular", "Best Seller", null, "New", "Creative", "Award Winner", "Kids Favorite"],
  },
  books: {
    imageSets: [
      tri("1524995997946-a1c2e315a42f", "1456513080510-7bf3a84b82f8", "1544716278-ca5e3f4abd8c"),
      tri("1515879218367-8466d910aaa4", "1481627834876-b7833e8f5570", "1512820543-2e96b80babb8"),
      tri("1532012197267-da1d6d7e7a6a", "1495640452828-3f6078bf6bc3", "1497633762265-9d179a990aa6"),
    ],
    types: ["Novel", "Academic Book", "Programming Guide", "Self-Help Book", "Story Book", "Grammar Book", "Dictionary", "Atlas", "Cookbook", "Business Book", "History Book", "Science Book", "Poetry Collection", "Biography", "Religious Book"],
    variants: ["Hardcover", "Paperback", "Illustrated", "Revised Edition", "Collector's", "Deluxe", "Pocket", "Special", "Anniversary", "Signed", "Box Set", "3-in-1", "5-Book Set", "Complete", "Essential"],
    adjectives: ["Bangla", "English", "Bilingual", "Bestseller", "Translated", "Local Author", "International", "Award Winning", "Classic", "Modern", "Academic", "Children's", "Young Adult", "Reference", "Workbook"],
    priceMin: 100,
    priceMax: 2500,
    badges: ["Bestseller", "Popular", null, "New Release", "Classic", "Award Winner", "Recommended", "Educational", "Must Read", "Gift Idea"],
  },
  furniture: {
    imageSets: [
      tri("1555041469-a586c61ea9bc", "1586023492125-27264fee1dce", "1555041469-a586c61ea9bc"),
      tri("1540518614846-7eded433c457", "1524758631624-e2822b8fd959", "1567016432779-094069958ea5"),
      tri("1493663284031-b7e3191512d8", "1558618666-fcd25c85cd64", "1555041469-a586c61ea9bc"),
    ],
    types: ["Sofa Set", "Dining Table", "Wardrobe", "Bookshelf", "Office Chair", "Study Table", "Bed Frame", "Coffee Table", "TV Cabinet", "Dressing Table", "Shoe Rack", "Kitchen Cabinet", "Nightstand", "Display Cabinet", "Recliner"],
    variants: ["Modern", "Classic", "Minimalist", "Luxury", "Rustic", "Scandinavian", "Industrial", "L-Shaped", "U-Shaped", "Foldable", "Stackable", "Modular", "Built-in", "Convertible", "Adjustable"],
    adjectives: ["Solid Wood", "MDF Board", "Teak Wood", "Mahogany", "Walnut", "Oak", "Fabric", "Leather", "Velvet", "Glass Top", "Marble Top", "Metal Frame", "3-Seater", "6-Seater", "King Size"],
    priceMin: 2000,
    priceMax: 80000,
    badges: ["Bestseller", "Sale", null, "Premium", "New Arrival", "Exclusive", "Modern", "Classic", "Popular", "Top Pick"],
  },
  grocery: {
    imageSets: [
      tri("1542838132-92c369a8f880", "1512621776951-a57141f2eefd", "1505935728-af093abf7178"),
      tri("1543168256-5d2616565899", "1490645935967-10de6ba17061", "1506484381205-f7945653044d"),
      tri("1553361371-9b22f78e8b1d", "1498557850523-fd3d118b962e", "1567620905732-2d1ec7ab7445"),
    ],
    types: ["Basmati Rice", "Mustard Oil", "Lentils Pack", "Sugar", "Salt", "Flour", "Spice Mix", "Tea Leaves", "Coffee Powder", "Honey", "Ghee", "Pickle Jar", "Soy Sauce", "Vinegar", "Biscuits Pack"],
    variants: ["Premium", "Organic", "Natural", "Pure", "Refined", "Unrefined", "Extra Virgin", "Cold Pressed", "Double Refined", "Fortified", "Iodized", "Raw", "Roasted", "Blended", "Single Origin"],
    adjectives: ["500g", "1kg", "2kg", "5kg", "250ml", "500ml", "1L", "2L", "Family Pack", "Eco Pack", "Value Pack", "Trial Size", "Bulk Buy", "Imported", "Local"],
    priceMin: 50,
    priceMax: 1500,
    badges: ["Daily Essential", "Sale", null, "Organic", "Popular", "Best Value", "Fresh", "Imported", "Local", "Bulk Deal"],
  },
  health: {
    imageSets: [
      tri("1559757148-5c350d0d3c56", "1505373877941-c22b4040e5e0", "1571019613454-1cb2f99b2d8b"),
      tri("1576678927484-cc907957088c", "1559757148-5c350d0d3c56", "1596068952574-ae680e8db432"),
      tri("1559757148-5c350d0d3c56", "1625850852370-9da5b6b2c37f", "1559757174-5c350d0d3c57"),
    ],
    types: ["Vitamin C Tablets", "Fish Oil Capsules", "Protein Powder", "Multivitamin", "Calcium Supplement", "Immunity Booster", "Blood Pressure Monitor", "Glucose Meter", "Thermometer", "Pulse Oximeter", "Knee Brace", "Back Support", "Pain Relief Cream", "Hand Sanitizer", "Face Mask Box"],
    variants: ["Advanced", "Extra Strength", "Chewable", "Time Release", "Clinical Strength", "Pharmaceutical Grade", "Sports Grade", "Premium", "Natural", "Herbal", "Digital", "Manual", "Portable", "Professional", "Disposable"],
    adjectives: ["60 Capsules", "90 Tablets", "120 Tablets", "500mg", "1000mg", "1kg", "2kg", "3kg", "Strawberry Flavor", "Chocolate Flavor", "Unflavored", "Sugar Free", "Gluten Free", "Non-GMO", "Lab Tested"],
    priceMin: 150,
    priceMax: 6000,
    badges: ["Lab Certified", "Popular", "Doctor Recommended", null, "New", "Best Seller", "Clinical Grade", "Natural", "Premium", "Sale"],
  },
  automotive: {
    imageSets: [
      tri("1503376780353-7e6692767b70", "1526726538690-5e8a0b4ccf8e", "1558618666-fcd25c85cd64"),
      tri("1449965408869-eaa3f722e40d", "1492144534655-ae79c964c9d7", "1558618666-fcd25c85cd64"),
      tri("1502877338535-766e1452684a", "1492144534655-ae79c964c9d7", "1503376780353-7e6692767b70"),
    ],
    types: ["Car Seat Cover", "Steering Wheel Cover", "Car Air Freshener", "Dash Cam", "Car Charger", "Tyre Inflator", "Jump Starter", "Car Vacuum", "Parking Sensor Kit", "LED Headlight Bulb", "Windshield Wiper", "Engine Oil", "Car Polish", "Tyre Pressure Gauge", "GPS Tracker"],
    variants: ["Universal", "Premium", "Heavy Duty", "Digital", "Wireless", "Portable", "Professional", "Multi-Car", "Waterproof", "Anti-Theft", "Smart", "LED", "USB", "Bluetooth", "Solar"],
    adjectives: ["Universal Fit", "All Car Models", "Leather", "Fabric", "Memory Foam", "4K", "Full HD", "12V", "24V", "150PSI", "2000A", "5500A", "HEPA Filter", "360° Coverage", "Quick Connect"],
    priceMin: 200,
    priceMax: 15000,
    badges: ["Best Seller", null, "New", "Popular", "Premium", "Safety", "Smart", "Durable", "Top Pick", "Sale"],
  },
};

const DESCRIPTIONS: Record<string, string[]> = {
  electronics: [
    "Latest technology with premium build quality. High performance for everyday use and professional tasks.",
    "Advanced features packed in a sleek design. Perfect for work, entertainment and gaming needs.",
    "Top-tier specifications with exceptional battery life. Fast performance and stunning display quality.",
    "Next-generation technology with cutting-edge features. Designed for power users and enthusiasts.",
    "Professional-grade device with premium materials. Delivers outstanding performance and reliability.",
  ],
  clothing: [
    "Premium quality fabric with expert craftsmanship. Comfortable fit for all-day wear and special occasions.",
    "Stylish design with durable construction. Available in multiple sizes and colors to suit your taste.",
    "Breathable fabric with elegant finishing. Perfect for casual outings, festivals and formal events.",
    "Contemporary design meets traditional craftsmanship. Easy care fabric that looks great wash after wash.",
    "Versatile piece that transitions from day to night. Flattering cut with superior fabric quality.",
  ],
  beauty: [
    "Dermatologist tested formula with natural ingredients. Gentle on skin, powerful results for daily use.",
    "Premium beauty product with long-lasting formula. Enhances natural beauty with professional-grade ingredients.",
    "Clinically proven formula with visible results in 4 weeks. Suitable for all skin types.",
    "Luxury beauty experience at an affordable price. Rich formula that nourishes and protects.",
    "Advanced skincare technology with active ingredients. Brightens, hydrates and rejuvenates your skin.",
  ],
  "home-appliances": [
    "Energy-efficient appliance with smart technology. Quiet operation and durable motor for long-lasting use.",
    "Multi-function design saves space and money. Easy to clean and maintain for everyday household use.",
    "Premium home appliance with advanced safety features. Auto shut-off and overheat protection built-in.",
    "High-performance motor with professional-grade results. Perfect for busy households and demanding tasks.",
    "Space-saving compact design without compromising power. Ideal for modern kitchens and small spaces.",
  ],
  sports: [
    "Professional-grade sports equipment for all fitness levels. Durable construction built to last years of use.",
    "Ergonomic design for maximum performance and comfort. Anti-slip grip and shock-absorbing technology.",
    "Premium sports gear used by professional athletes. Certified safe with international quality standards.",
    "High-performance equipment to elevate your training. Lightweight yet incredibly durable construction.",
    "Versatile fitness equipment for home and gym use. Easy to store and maintain between workouts.",
  ],
  bags: [
    "Premium quality bag with multiple compartments for organized storage. Durable zippers and sturdy handles.",
    "Stylish yet functional design with water-resistant material. Perfect for work, travel and daily use.",
    "Spacious interior with padded laptop sleeve. Ergonomic shoulder straps for all-day comfort.",
    "Trendy design with anti-theft hidden pocket. Lightweight construction for comfortable everyday carry.",
    "Multi-purpose bag with adjustable straps and breathable back panel. Ideal for urban commuters.",
  ],
  shoes: [
    "Premium footwear with memory foam insole for all-day comfort. Non-slip outsole for safe walking.",
    "Stylish design with breathable mesh upper. Flexible sole provides natural movement and support.",
    "Genuine leather upper with cushioned insole. Crafted for comfort and durability through daily wear.",
    "Lightweight construction with arch support technology. Perfect for long walks and active lifestyles.",
    "Classic design with modern comfort features. Easy to pair with casual and formal outfits.",
  ],
  watches: [
    "Premium timepiece with scratch-resistant sapphire crystal. Water resistant with precise Japanese movement.",
    "Elegant design with stainless steel case and strap. Luminous hands for easy reading in dark.",
    "Smart features combined with classic watch aesthetics. Heart rate monitoring and step counting built-in.",
    "Swiss-inspired movement with precision timekeeping. Dress watch perfect for business and formal events.",
    "Durable sports watch with military-grade construction. Multiple time zones and alarm functions.",
  ],
  kids: [
    "Safe, non-toxic materials certified for children. Promotes creativity, learning and motor skill development.",
    "Colorful and engaging toy for hours of entertainment. Encourages imaginative play and problem-solving.",
    "Educational toy that makes learning fun and interactive. Suitable for the recommended age group.",
    "Durable construction that withstands rough play. Easy to clean and store after playtime.",
    "Award-winning toy that children love. Develops cognitive skills while providing endless entertainment.",
  ],
  books: [
    "Engaging content from a renowned author. Beautifully printed with high-quality paper and binding.",
    "Comprehensive coverage of the subject matter. Clear explanations with helpful illustrations and examples.",
    "Bestselling title with excellent reader reviews. Perfect for beginners and experienced readers alike.",
    "Well-researched content with practical insights. A must-read for anyone interested in this topic.",
    "Thoughtfully written with accessible language. Includes exercises and activities for deeper understanding.",
  ],
  furniture: [
    "Solid wood construction with premium finish. Easy assembly with all hardware included. Durable for years.",
    "Modern design that fits any interior style. Smooth finish with scratch-resistant surface treatment.",
    "Ergonomic design for maximum comfort and support. Premium upholstery with easy-clean fabric.",
    "Space-saving design perfect for urban homes. Sturdy frame with high weight capacity and stability.",
    "Elegant craftsmanship with attention to detail. Timeless design that complements any room decor.",
  ],
  grocery: [
    "Fresh and pure quality sourced from trusted suppliers. No artificial preservatives or additives.",
    "Premium grade product with consistent quality in every pack. Ideal for daily cooking and nutrition.",
    "Carefully processed and hygienically packed. Rich flavor and aroma for authentic cooking results.",
    "100% natural with no added chemicals. Nutritious and wholesome for your family's daily needs.",
    "Imported quality at local prices. Superior taste and freshness guaranteed with every purchase.",
  ],
  health: [
    "Pharmaceutical-grade supplement with clinically proven ingredients. Lab tested for purity and potency.",
    "Advanced formula with optimal bioavailability for maximum absorption. No artificial colors or flavors.",
    "Professional health product recommended by healthcare providers. Supports overall wellness and vitality.",
    "High-quality health supplement with natural active ingredients. Suitable for adults and seniors.",
    "Precision health device with accurate readings and easy operation. Ideal for home health monitoring.",
  ],
  automotive: [
    "Universal fit compatible with most car models. Easy installation with no tools required. Durable material.",
    "Premium automotive accessory with professional-grade quality. Enhances your driving experience and safety.",
    "High-performance car product with advanced technology. Protects and improves your vehicle performance.",
    "Smart automotive solution with user-friendly operation. Built to withstand extreme temperatures and conditions.",
    "Essential car accessory with long-lasting durability. Improves comfort, safety and vehicle appearance.",
  ],
};

function buildProductName(type: string, variant: string, adjective: string, index: number): string {
  // Mix different name patterns for variety
  const patterns = [
    `${type} ${variant} ${adjective}`,
    `${adjective} ${type} ${variant}`,
    `${variant} ${type} - ${adjective}`,
    `${type} ${adjective} Edition`,
    `${variant} ${adjective} ${type}`,
  ];
  return patterns[index % patterns.length]!;
}

function generateAllProducts(catMap: Map<string, number | undefined>) {
  const products: Array<{
    name: string;
    description: string;
    price: string;
    comparePrice: string;
    images: string[];
    categoryId: number | null;
    stock: number;
    featured: boolean;
    badge: string | null;
  }> = [];

  const slugs = Object.keys(CATEGORY_CONFIGS);
  const TARGET = 5000;
  const perCategory = Math.ceil(TARGET / slugs.length); // ~357

  for (const slug of slugs) {
    const cfg = CATEGORY_CONFIGS[slug]!;
    const descs = DESCRIPTIONS[slug]!;
    const catId = catMap.get(slug) ?? null;
    let count = 0;

    outer: for (let ai = 0; ai < cfg.adjectives.length; ai++) {
      for (let vi = 0; vi < cfg.variants.length; vi++) {
        for (let ti = 0; ti < cfg.types.length; ti++) {
          if (count >= perCategory) break outer;

          const idx = count;
          const name = buildProductName(
            cfg.types[ti]!,
            cfg.variants[vi]!,
            cfg.adjectives[ai]!,
            idx
          );

          // Pick image triplet from pool (cycling)
          const imgSet = cfg.imageSets[idx % cfg.imageSets.length]!;

          // Price interpolation within range
          const priceRatio = (ai * cfg.variants.length + vi) / (cfg.adjectives.length * cfg.variants.length);
          const rawPrice = cfg.priceMin + Math.round(priceRatio * (cfg.priceMax - cfg.priceMin));
          // Round to nice numbers
          const price = Math.round(rawPrice / 50) * 50 || cfg.priceMin;
          const comparePrice = Math.round((price * (1.3 + (idx % 5) * 0.04)) / 50) * 50;

          const badge = cfg.badges[idx % cfg.badges.length] ?? null;
          const featured = idx % 7 === 0; // every 7th product is featured
          const stock = 10 + ((idx * 13) % 490); // 10–499 stock
          const desc = descs[idx % descs.length]!;

          products.push({
            name,
            description: desc,
            price: String(price),
            comparePrice: String(comparePrice),
            images: imgSet,
            categoryId: catId,
            stock,
            featured,
            badge,
          });

          count++;
        }
      }
    }
  }

  return products;
}

export async function seedIfEmpty() {
  try {
    // Seed admin
    const existingAdmins = await db.select().from(adminTable).limit(1);
    if (existingAdmins.length === 0) {
      const passwordHash = await bcrypt.hash("AcholGatha@2025", 12);
      await db.insert(adminTable).values({
        username: "admin",
        passwordHash,
      });
      logger.info("Admin seeded: username=admin, password=AcholGatha@2025");
    }

    // Seed site settings
    const existingSettings = await db.select().from(siteSettingsTable).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(siteSettingsTable).values({
        siteName: "AcholGatha",
        tagline: "Your Favourite Online Shop",
        bkashNumber: "01700000000",
        rocketNumber: "01800000000",
        whatsappNumber: "01700000000",
        heroTitle: "Best Products, Best Prices",
        heroSubtitle: "Bangladesh's #1 online shopping platform — Pay with bKash or Cash on Delivery",
        footerText: `© ${new Date().getFullYear()} AcholGatha. All rights reserved.`,
        showAnnouncement: true,
        announcementText: "🔥 Special Offer: Order today — FREE delivery on orders BDT 500+!",
      });
      logger.info("Site settings seeded for AcholGatha");
    }

    // Seed categories — upsert all required categories
    const allRequiredCats = [
      { name: "Electronics", slug: "electronics" },
      { name: "Clothing", slug: "clothing" },
      { name: "Beauty", slug: "beauty" },
      { name: "Home Appliances", slug: "home-appliances" },
      { name: "Sports", slug: "sports" },
      { name: "Bags", slug: "bags" },
      { name: "Shoes", slug: "shoes" },
      { name: "Watches", slug: "watches" },
      { name: "Kids", slug: "kids" },
      { name: "Books", slug: "books" },
      { name: "Furniture", slug: "furniture" },
      { name: "Grocery", slug: "grocery" },
      { name: "Health", slug: "health" },
      { name: "Automotive", slug: "automotive" },
    ];
    const existingCats = await db.select().from(categoriesTable);
    const existingSlugs = new Set(existingCats.map((c) => c.slug));
    const missingCats = allRequiredCats.filter((c) => !existingSlugs.has(c.slug));
    if (missingCats.length > 0) {
      await db.insert(categoriesTable).values(missingCats);
      logger.info(`Categories seeded: added ${missingCats.map((c) => c.slug).join(", ")}`);
    }

    // Seed products — 5000 demo products with 3 angle images each
    const existingProducts = await db.select({ id: productsTable.id }).from(productsTable);
    if (existingProducts.length < 5000) {
      const cats = await db.select().from(categoriesTable);
      const catMap = new Map(cats.map((c) => [c.slug, c.id]));

      const existingCount = await db.select({ id: productsTable.id }).from(productsTable);
      const allGenerated = generateAllProducts(catMap);

      // Fetch existing names to avoid duplicates
      const existingNameRows = await db
        .select({ name: productsTable.name })
        .from(productsTable);
      const existingNames = new Set(existingNameRows.map((r) => r.name));

      const toInsert = allGenerated.filter((p) => !existingNames.has(p.name));

      if (toInsert.length > 0) {
        // Insert in batches of 500 to avoid query size limits
        const BATCH = 500;
        let inserted = 0;
        for (let i = 0; i < toInsert.length; i += BATCH) {
          const batch = toInsert.slice(i, i + BATCH);
          await db.insert(productsTable).values(batch);
          inserted += batch.length;
          logger.info(`Products seeded: ${inserted}/${toInsert.length} inserted…`);
        }
        logger.info(`Products seeded: ${toInsert.length} new products added (existing: ${existingCount.length})`);
      } else {
        logger.info("Products: all generated products already exist, skipping.");
      }
    }

    // Seed banners
    const existingBanners = await db.select().from(bannersTable).limit(1);
    if (existingBanners.length === 0) {
      await db.insert(bannersTable).values([
        {
          title: "Welcome to AcholGatha!",
          subtitle: "Bangladesh's best online shopping — thousands of products at best prices",
          imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=500&fit=crop",
          linkUrl: "/products",
          sortOrder: 1,
          active: true,
        },
        {
          title: "Grand Sale is On!",
          subtitle: "Up to 30% off on all products — Limited time offer",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&h=500&fit=crop",
          linkUrl: "/products",
          sortOrder: 2,
          active: true,
        },
        {
          title: "New Fashion Collection",
          subtitle: "Special designer pieces for Eid & festivals have arrived",
          imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=500&fit=crop",
          linkUrl: "/products?category=clothing",
          sortOrder: 3,
          active: true,
        },
      ]);
      logger.info("Banners seeded");
    }
  } catch (err) {
    logger.error({ err }, "Seed error");
  }
}
