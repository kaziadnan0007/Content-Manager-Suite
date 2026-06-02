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

    // Seed products — expand to 155+ products
    const existingProducts = await db.select().from(productsTable);
    if (existingProducts.length < 155) {
      const cats = await db.select().from(categoriesTable);
      const catMap = new Map(cats.map((c) => [c.slug, c.id]));

      const existingNames = new Set(existingProducts.map((p) => p.name));

      const allProducts = [
        // ── Electronics ──────────────────────────────────────────────────────
        {
          name: "Smartphone Pro Max 128GB",
          description: "Latest technology premium smartphone. 6.7-inch AMOLED display, 108MP triple camera, 5000mAh battery, 65W fast charging.",
          price: "18999", comparePrice: "24000",
          images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 50, featured: true, badge: "Best Seller",
        },
        {
          name: "Wireless Noise Cancelling Earbuds",
          description: "Premium ANC wireless earbuds. 30-hour battery life, IPX5 waterproof, crystal clear audio.",
          price: "2499", comparePrice: "4200",
          images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 100, featured: true, badge: "Hot Deal",
        },
        {
          name: "Ultrabook Laptop i7 16GB",
          description: "Intel Core i7 processor, 16GB RAM, 512GB SSD, 14-inch IPS display, backlit keyboard.",
          price: "55000", comparePrice: "68000",
          images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 15, featured: true, badge: "Premium",
        },
        {
          name: "Portable Bluetooth Speaker",
          description: "360° deep bass portable speaker. 24-hour playback, waterproof design, perfect for outdoors.",
          price: "1999", comparePrice: "3200",
          images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 80, featured: false, badge: "New",
        },
        {
          name: "Fast Charging Power Bank 20000mAh",
          description: "20000mAh capacity, 65W PD fast charging support. Charge 3 devices simultaneously.",
          price: "1450", comparePrice: "2200",
          images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 120, featured: false, badge: "Sale",
        },
        {
          name: "10-inch WiFi Tablet",
          description: "10.1-inch FHD display tablet, 4GB RAM, 64GB storage, 8000mAh battery.",
          price: "12500", comparePrice: "16000",
          images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 25, featured: true, badge: "Hot",
        },
        {
          name: "Smart 43\" 4K Android TV",
          description: "43-inch 4K Ultra HD Smart TV. Google Assistant built-in, HDR10+, 60Hz refresh rate.",
          price: "35000", comparePrice: "45000",
          images: ["https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 20, featured: true, badge: "Best Seller",
        },
        {
          name: "Mechanical Gaming Keyboard RGB",
          description: "TKL mechanical keyboard with Cherry MX switches. Per-key RGB lighting, N-key rollover.",
          price: "3200", comparePrice: "5000",
          images: ["https://images.unsplash.com/photo-1595225476474-59fc01e48b4c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 45, featured: false, badge: "Gaming",
        },
        {
          name: "Wireless Gaming Mouse 6400 DPI",
          description: "Ultra-lightweight 68g wireless gaming mouse. 6400 DPI sensor, 70-hour battery, RGB.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 60, featured: false, badge: "Gaming",
        },
        {
          name: "USB-C Hub 7-in-1 Multiport",
          description: "7-in-1 USB-C hub: 4K HDMI, 100W PD, 3× USB 3.0, SD card, TF card slots.",
          price: "1200", comparePrice: "2000",
          images: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 90, featured: false, badge: "Sale",
        },
        {
          name: "Ring Light 10\" with Phone Holder",
          description: "10-inch LED ring light with tripod stand and phone holder. 3 light modes, dimmable.",
          price: "1100", comparePrice: "1800",
          images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 75, featured: false, badge: "Popular",
        },
        {
          name: "DSLR Camera 24.2MP APS-C",
          description: "24.2MP APS-C CMOS sensor DSLR camera. 4K video, built-in WiFi, flip touchscreen.",
          price: "72000", comparePrice: "88000",
          images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 8, featured: true, badge: "Pro",
        },

        // ── Watches ──────────────────────────────────────────────────────────
        {
          name: "Smart Fitness Watch Pro",
          description: "Heart rate, SpO2, stress monitoring. 1.43-inch AMOLED display, 14-day battery life.",
          price: "3999", comparePrice: "6000",
          images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop"],
          categoryId: catMap.get("watches") ?? null, stock: 60, featured: true, badge: "Popular",
        },
        {
          name: "Classic Analog Couple Watch",
          description: "Premium stainless steel bracelet classic design watch. Water resistant.",
          price: "2200", comparePrice: "3500",
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"],
          categoryId: catMap.get("watches") ?? null, stock: 40, featured: false, badge: null,
        },
        {
          name: "Digital Sports Watch Waterproof",
          description: "Military-grade digital watch. Shock-resistant, 50m waterproof, stopwatch, alarm.",
          price: "1200", comparePrice: "1900",
          images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&h=500&fit=crop"],
          categoryId: catMap.get("watches") ?? null, stock: 80, featured: false, badge: "Sale",
        },
        {
          name: "Rose Gold Ladies Watch",
          description: "Elegant rose gold ladies watch with crystal-encrusted bezel. Stainless steel strap.",
          price: "3200", comparePrice: "5000",
          images: ["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&h=500&fit=crop"],
          categoryId: catMap.get("watches") ?? null, stock: 30, featured: true, badge: "Luxury",
        },
        {
          name: "Automatic Mechanical Skeleton Watch",
          description: "Skeleton dial automatic mechanical watch. Sapphire crystal glass, genuine leather strap.",
          price: "8500", comparePrice: "13000",
          images: ["https://images.unsplash.com/photo-1584868072262-b2a4c9a3fe50?w=500&h=500&fit=crop"],
          categoryId: catMap.get("watches") ?? null, stock: 15, featured: true, badge: "Exclusive",
        },
        {
          name: "Children LED Digital Watch",
          description: "Colorful LED digital kids watch. Waterproof, shockproof, adjustable silicone strap.",
          price: "450", comparePrice: "750",
          images: ["https://images.unsplash.com/photo-1617891046880-6caa6ef5d04d?w=500&h=500&fit=crop"],
          categoryId: catMap.get("watches") ?? null, stock: 150, featured: false, badge: "Kids",
        },

        // ── Clothing ─────────────────────────────────────────────────────────
        {
          name: "Designer Silk Saree",
          description: "Handwoven premium designer silk saree. Perfect for festivals and special occasions.",
          price: "3500", comparePrice: "5000",
          images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 30, featured: true, badge: "Exclusive",
        },
        {
          name: "Premium Cotton Panjabi",
          description: "100% pure cotton comfortable Panjabi. Available in multiple colors and sizes.",
          price: "899", comparePrice: "1400",
          images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4466?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 200, featured: true, badge: "Top Pick",
        },
        {
          name: "Graphic T-Shirt Collection",
          description: "100% cotton premium graphic t-shirts. Available in various designs and sizes.",
          price: "499", comparePrice: "850",
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 300, featured: false, badge: null,
        },
        {
          name: "Three-Piece Salwar Kameez",
          description: "Printed three-piece salwar kameez set. Light and comfortable fabric.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 80, featured: true, badge: "Trending",
        },
        {
          name: "Slim Fit Jeans",
          description: "Premium stretch denim slim fit jeans. 5-pocket design, available in multiple shades.",
          price: "1100", comparePrice: "1800",
          images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 150, featured: false, badge: null,
        },
        {
          name: "Winter Fleece Hoodie Premium",
          description: "Soft fleece hoodie for cold weather. Kangaroo pocket, ribbed cuffs, unisex design.",
          price: "1350", comparePrice: "2200",
          images: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 100, featured: false, badge: "Winter",
        },
        {
          name: "Women's Kurti Collection",
          description: "Elegant printed kurti for women. Rayon fabric, A-line cut, multiple sizes available.",
          price: "799", comparePrice: "1300",
          images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 180, featured: true, badge: "Trending",
        },
        {
          name: "Linen Kurta Set for Men",
          description: "Pure linen kurta with matching pajama. Breathable fabric, traditional fit.",
          price: "1200", comparePrice: "1900",
          images: ["https://images.unsplash.com/photo-1617952739613-f53f7c28f7b7?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 90, featured: false, badge: null,
        },
        {
          name: "Polo T-Shirt Men Premium",
          description: "Premium pique cotton polo shirt. Embroidered logo, regular fit, UV protection.",
          price: "699", comparePrice: "1100",
          images: ["https://images.unsplash.com/photo-1625910513459-42eba84ab73c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 220, featured: false, badge: null,
        },
        {
          name: "Formal Blazer Slim Fit",
          description: "Slim fit formal blazer. Notch lapel, two-button, single vent, fully lined.",
          price: "4200", comparePrice: "6500",
          images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 35, featured: true, badge: "Formal",
        },
        {
          name: "Casual Shorts Men",
          description: "Comfortable cotton casual shorts. Elastic waistband with drawstring, two side pockets.",
          price: "550", comparePrice: "900",
          images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 200, featured: false, badge: null,
        },
        {
          name: "Boys School Shirt White",
          description: "Premium white school shirt for boys. Easy-care cotton blend, durable construction.",
          price: "380", comparePrice: "599",
          images: ["https://images.unsplash.com/photo-1503341338985-c0477be52513?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 400, featured: false, badge: "School",
        },

        // ── Beauty ───────────────────────────────────────────────────────────
        {
          name: "Natural Face Wash Kit",
          description: "Natural ingredients face wash and moisturizer combo pack. Suitable for all skin types.",
          price: "599", comparePrice: "950",
          images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 150, featured: false, badge: "Sale",
        },
        {
          name: "Hyaluronic Acid Moisturizer",
          description: "24-hour hydration premium moisturizer with SPF-30 sunscreen. Dermatologist tested.",
          price: "650", comparePrice: "1100",
          images: ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 120, featured: false, badge: null,
        },
        {
          name: "Matte Finish Lipstick 6-Piece Set",
          description: "Long-lasting matte finish lipstick set. 6 trendy shades in a beautiful gift box.",
          price: "750", comparePrice: "1200",
          images: ["https://images.unsplash.com/photo-1586495777744-4e6b0a2c5b06?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 200, featured: true, badge: "Gift",
        },
        {
          name: "Premium Perfume EDT 100ml",
          description: "French fragrance technology premium perfume. 8-12 hours long-lasting scent.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 60, featured: true, badge: "Luxury",
        },
        {
          name: "Vitamin C Brightening Serum 30ml",
          description: "20% Vitamin C serum with niacinamide. Fades dark spots, brightens skin tone.",
          price: "890", comparePrice: "1500",
          images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 100, featured: true, badge: "Popular",
        },
        {
          name: "BB Cream Foundation SPF30",
          description: "All-in-one BB cream. Moisturizes, covers and protects. 5 shades available.",
          price: "550", comparePrice: "900",
          images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 180, featured: false, badge: null,
        },
        {
          name: "Deep Conditioning Hair Mask 250ml",
          description: "Argan oil & keratin hair mask. Repairs damaged hair, reduces frizz, adds shine.",
          price: "680", comparePrice: "1100",
          images: ["https://images.unsplash.com/photo-1527799820374-87036c46df5f?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 90, featured: false, badge: null,
        },
        {
          name: "Nail Polish Set 12 Colors",
          description: "Long-lasting chip-free nail polish set. 12 trendy colors, quick dry formula.",
          price: "480", comparePrice: "800",
          images: ["https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 200, featured: false, badge: "Set",
        },
        {
          name: "Sunscreen SPF50+ PA+++ 60ml",
          description: "Lightweight non-greasy sunscreen SPF50+. UVA/UVB protection, suitable for daily use.",
          price: "420", comparePrice: "700",
          images: ["https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 250, featured: false, badge: "Sale",
        },
        {
          name: "Eyebrow Pencil & Gel Set",
          description: "Micro-precision eyebrow pencil with setting gel. Waterproof, 3 natural shades.",
          price: "350", comparePrice: "600",
          images: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 300, featured: false, badge: null,
        },

        // ── Home Appliances ──────────────────────────────────────────────────
        {
          name: "Digital Rice Cooker Deluxe 3L",
          description: "3-litre capacity multifunction rice cooker with steam, slow cook and warm modes.",
          price: "2200", comparePrice: "3200",
          images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 45, featured: false, badge: null,
        },
        {
          name: "High-Power Blender 1000W",
          description: "1000W motor professional blender. Perfect for smoothies, juices and soups.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 35, featured: false, badge: null,
        },
        {
          name: "Memory Foam Pillow 2-Piece Set",
          description: "Orthopedic memory foam pillows. Improves sleep quality, reduces neck pain.",
          price: "950", comparePrice: "1500",
          images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 80, featured: false, badge: "Combo",
        },
        {
          name: "Bagless Vacuum Cleaner 2000W",
          description: "Powerful 2000W bagless vacuum cleaner. HEPA filter, 2L dust capacity, quiet motor.",
          price: "5500", comparePrice: "8000",
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 20, featured: true, badge: "Hot",
        },
        {
          name: "Air Purifier HEPA H13 Filter",
          description: "True HEPA H13 air purifier. Removes 99.97% pollutants, covers 500 sq ft, quiet.",
          price: "7200", comparePrice: "10500",
          images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 18, featured: false, badge: "Health",
        },
        {
          name: "Electric Kettle 1.5L Stainless Steel",
          description: "1.5L stainless steel electric kettle. 2200W rapid boil, auto shut-off, boil-dry protection.",
          price: "1100", comparePrice: "1800",
          images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 65, featured: false, badge: null,
        },
        {
          name: "Non-Stick Sandwich Maker 750W",
          description: "750W sandwich maker with non-stick plates. Makes 2 sandwiches, cool-touch handle.",
          price: "850", comparePrice: "1400",
          images: ["https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 55, featured: false, badge: null,
        },
        {
          name: "Steam Iron 2400W Ceramic Soleplate",
          description: "2400W steam iron with ceramic soleplate. Variable steam, self-clean, drip stop.",
          price: "1450", comparePrice: "2300",
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 40, featured: false, badge: null,
        },
        {
          name: "Table Fan 3-Speed 16 inch",
          description: "16-inch 3-speed table fan. Quiet motor, 180° oscillation, energy saving.",
          price: "1200", comparePrice: "1900",
          images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 70, featured: false, badge: null,
        },
        {
          name: "LED Desk Lamp with USB Charging",
          description: "Eye-care LED desk lamp. 5 brightness levels, 3 color modes, built-in USB port.",
          price: "950", comparePrice: "1600",
          images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 85, featured: false, badge: "Sale",
        },

        // ── Bags ─────────────────────────────────────────────────────────────
        {
          name: "Urban Backpack with Laptop Slot",
          description: "Waterproof backpack with 15.6-inch laptop slot. USB charging port, 30L capacity.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop"],
          categoryId: catMap.get("bags") ?? null, stock: 60, featured: true, badge: "Trending",
        },
        {
          name: "Premium Leather Handbag",
          description: "Genuine leather premium handbag. Multiple compartments, detachable strap.",
          price: "3200", comparePrice: "5000",
          images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop"],
          categoryId: catMap.get("bags") ?? null, stock: 30, featured: true, badge: "Luxury",
        },
        {
          name: "Crossbody Sling Bag Men",
          description: "Casual crossbody sling bag. Water-resistant Oxford fabric, anti-theft design.",
          price: "950", comparePrice: "1600",
          images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop"],
          categoryId: catMap.get("bags") ?? null, stock: 80, featured: false, badge: null,
        },
        {
          name: "Travel Duffle Bag 60L Waterproof",
          description: "60L large capacity travel bag. Waterproof, detachable shoulder strap, shoe compartment.",
          price: "2200", comparePrice: "3500",
          images: ["https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=500&h=500&fit=crop"],
          categoryId: catMap.get("bags") ?? null, stock: 40, featured: false, badge: "Travel",
        },
        {
          name: "Kids School Bag Cartoon",
          description: "Ergonomic kids school bag. Lightweight, breathable back panel, reflective strips.",
          price: "750", comparePrice: "1200",
          images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop"],
          categoryId: catMap.get("bags") ?? null, stock: 120, featured: false, badge: "Kids",
        },
        {
          name: "Insulated Lunch Bag",
          description: "Thermal insulated lunch bag keeps food hot/cold for 5 hours. Leak-proof lining.",
          price: "550", comparePrice: "900",
          images: ["https://images.unsplash.com/photo-1578374173705-969cbe6f2d6b?w=500&h=500&fit=crop"],
          categoryId: catMap.get("bags") ?? null, stock: 150, featured: false, badge: null,
        },
        {
          name: "Fashion Fanny Pack Unisex",
          description: "Trendy fanny pack. Water-resistant, multiple pockets, adjustable waist strap.",
          price: "650", comparePrice: "1050",
          images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop"],
          categoryId: catMap.get("bags") ?? null, stock: 100, featured: false, badge: "Trending",
        },
        {
          name: "Business Leather Briefcase",
          description: "Genuine leather business briefcase. Fits 15.6-inch laptop, padlock closure.",
          price: "4500", comparePrice: "7000",
          images: ["https://images.unsplash.com/photo-1568027762272-e4da8b386fe9?w=500&h=500&fit=crop"],
          categoryId: catMap.get("bags") ?? null, stock: 20, featured: false, badge: "Professional",
        },

        // ── Shoes ────────────────────────────────────────────────────────────
        {
          name: "Air Cushion Running Shoes",
          description: "Air cushion technology premium running shoes. Breathable mesh upper, lightweight.",
          price: "2500", comparePrice: "4000",
          images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"],
          categoryId: catMap.get("shoes") ?? null, stock: 70, featured: true, badge: "Hot",
        },
        {
          name: "Casual Leather Sandals",
          description: "Genuine leather casual sandals. Comfortable footbed, non-slip sole.",
          price: "1100", comparePrice: "1800",
          images: ["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&h=500&fit=crop"],
          categoryId: catMap.get("shoes") ?? null, stock: 90, featured: false, badge: null,
        },
        {
          name: "Formal Leather Oxford Shoes",
          description: "Genuine leather Oxford dress shoes. Brogue detailing, rubber sole, formal design.",
          price: "3800", comparePrice: "6000",
          images: ["https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=500&h=500&fit=crop"],
          categoryId: catMap.get("shoes") ?? null, stock: 35, featured: true, badge: "Formal",
        },
        {
          name: "Women Sports Sneakers",
          description: "Lightweight women's sports sneakers. Mesh upper, memory foam insole, flex sole.",
          price: "1850", comparePrice: "2900",
          images: ["https://images.unsplash.com/photo-1485632662924-c0088c55025f?w=500&h=500&fit=crop"],
          categoryId: catMap.get("shoes") ?? null, stock: 65, featured: false, badge: null,
        },
        {
          name: "Ankle Boots Stylish Women",
          description: "Block heel ankle boots. Side zip, cushioned insole, durable synthetic upper.",
          price: "2200", comparePrice: "3500",
          images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop"],
          categoryId: catMap.get("shoes") ?? null, stock: 45, featured: false, badge: "Trending",
        },
        {
          name: "Loafers Slip-On Men",
          description: "Comfortable penny loafers. Genuine upper leather, rubber sole, versatile style.",
          price: "1500", comparePrice: "2400",
          images: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500&h=500&fit=crop"],
          categoryId: catMap.get("shoes") ?? null, stock: 55, featured: false, badge: null,
        },
        {
          name: "High Heels Party Shoes Women",
          description: "3-inch block heel party shoes. Ankle strap, cushioned footbed, elegant design.",
          price: "1200", comparePrice: "2000",
          images: ["https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=500&h=500&fit=crop"],
          categoryId: catMap.get("shoes") ?? null, stock: 50, featured: false, badge: "Party",
        },
        {
          name: "Flip Flops Beach Slippers",
          description: "Lightweight EVA flip flops. Anti-slip sole, cushioned footbed, waterproof.",
          price: "250", comparePrice: "450",
          images: ["https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&h=500&fit=crop"],
          categoryId: catMap.get("shoes") ?? null, stock: 300, featured: false, badge: null,
        },

        // ── Sports ───────────────────────────────────────────────────────────
        {
          name: "Cricket Bat English Willow",
          description: "Grade-A English willow cricket bat. Full center profile, professional grade.",
          price: "2800", comparePrice: "4200",
          images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 25, featured: false, badge: null,
        },
        {
          name: "Professional Football Size 5",
          description: "FIFA approved professional football. 32-panel design, durable PU leather.",
          price: "950", comparePrice: "1500",
          images: ["https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 50, featured: false, badge: null,
        },
        {
          name: "Premium Yoga Mat 6mm",
          description: "6mm thick anti-slip yoga mat. Eco-friendly TPE material, carry bag included.",
          price: "799", comparePrice: "1300",
          images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 80, featured: false, badge: "Sale",
        },
        {
          name: "Resistance Band Set 5-Level",
          description: "5-piece resistance band set. 10-50lbs resistance levels, non-slip design, carry bag.",
          price: "650", comparePrice: "1100",
          images: ["https://images.unsplash.com/photo-1598971639058-fab3c3109a56?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 100, featured: false, badge: "Fitness",
        },
        {
          name: "Speed Jump Rope Adjustable",
          description: "Adjustable speed jump rope. Ball-bearing handles, PVC rope, length adjustable.",
          price: "350", comparePrice: "600",
          images: ["https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 150, featured: false, badge: null,
        },
        {
          name: "Badminton Racket Set 2-Piece",
          description: "Carbon fiber badminton racket set with 3 shuttlecocks. For beginner to intermediate.",
          price: "1100", comparePrice: "1800",
          images: ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 40, featured: false, badge: "Set",
        },
        {
          name: "Tennis Racket Premium Carbon",
          description: "Premium carbon composite tennis racket. 280g, 100 sq inch head, pre-strung.",
          price: "2200", comparePrice: "3400",
          images: ["https://images.unsplash.com/photo-1545809074-59472b3f5ecc?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 25, featured: false, badge: null,
        },
        {
          name: "Swimming Goggles Anti-Fog UV",
          description: "Anti-fog UV protection swim goggles. Wide view, silicone seal, adjustable strap.",
          price: "480", comparePrice: "800",
          images: ["https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 90, featured: false, badge: null,
        },

        // ── Kids ─────────────────────────────────────────────────────────────
        {
          name: "Educational Wooden Building Blocks 100pcs",
          description: "100-piece wooden building blocks set. Develops creativity and fine motor skills.",
          price: "1200", comparePrice: "1900",
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
          categoryId: catMap.get("kids") ?? null, stock: 60, featured: true, badge: "Educational",
        },
        {
          name: "Remote Control Car Off-Road",
          description: "4WD off-road RC car with 2.4GHz remote. Up to 40km/h, USB rechargeable.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1555448248-2571daf6344b?w=500&h=500&fit=crop"],
          categoryId: catMap.get("kids") ?? null, stock: 45, featured: true, badge: "Popular",
        },
        {
          name: "Baby Soft Toy Gift Set",
          description: "Set of 5 plush soft toys. Baby-safe materials, machine washable, colorful designs.",
          price: "850", comparePrice: "1400",
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
          categoryId: catMap.get("kids") ?? null, stock: 80, featured: false, badge: "Gift",
        },
        {
          name: "Kids Art & Craft Set 60pcs",
          description: "60-piece complete art set. Colored pencils, watercolors, markers, sketchbook.",
          price: "750", comparePrice: "1200",
          images: ["https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&h=500&fit=crop"],
          categoryId: catMap.get("kids") ?? null, stock: 100, featured: false, badge: "Creative",
        },
        {
          name: "Children Bicycle 16-inch",
          description: "16-inch kids bicycle with training wheels. Adjustable seat, hand brakes, bell.",
          price: "4500", comparePrice: "7000",
          images: ["https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=500&h=500&fit=crop"],
          categoryId: catMap.get("kids") ?? null, stock: 20, featured: true, badge: "Best Seller",
        },
        {
          name: "Play-Dough Set 12 Colors",
          description: "Non-toxic play-dough set with 12 colors. Includes molds and tools, safe for kids 3+.",
          price: "480", comparePrice: "800",
          images: ["https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500&h=500&fit=crop"],
          categoryId: catMap.get("kids") ?? null, stock: 200, featured: false, badge: null,
        },

        // ── Furniture ────────────────────────────────────────────────────────
        {
          name: "Ergonomic Office Chair Mesh Back",
          description: "Breathable mesh office chair. Lumbar support, adjustable armrests, 360° swivel.",
          price: "8500", comparePrice: "13000",
          images: ["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=500&fit=crop"],
          categoryId: catMap.get("furniture") ?? null, stock: 20, featured: true, badge: "Office",
        },
        {
          name: "Wooden Study Table 120cm",
          description: "Solid wood study table. 120x60cm, built-in storage shelves, cable management hole.",
          price: "6500", comparePrice: "10000",
          images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop"],
          categoryId: catMap.get("furniture") ?? null, stock: 15, featured: false, badge: null,
        },
        {
          name: "3-Seater Sofa Set Modern",
          description: "Contemporary 3-seater sofa. High-density foam cushions, durable fabric upholstery.",
          price: "22000", comparePrice: "35000",
          images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop"],
          categoryId: catMap.get("furniture") ?? null, stock: 8, featured: true, badge: "Premium",
        },
        {
          name: "Bookshelf 5-Tier Wooden",
          description: "5-tier bookshelf in solid pine. 180x80x30cm, holds up to 50kg per shelf.",
          price: "4200", comparePrice: "6500",
          images: ["https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&h=500&fit=crop"],
          categoryId: catMap.get("furniture") ?? null, stock: 25, featured: false, badge: "Storage",
        },
        {
          name: "King Size Bed Frame with Headboard",
          description: "King size bed frame in walnut finish. Upholstered headboard, slat support, no box spring needed.",
          price: "18000", comparePrice: "28000",
          images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=500&fit=crop"],
          categoryId: catMap.get("furniture") ?? null, stock: 10, featured: true, badge: "Luxury",
        },
        {
          name: "Coffee Table Glass Top Round",
          description: "Round glass top coffee table. Tempered glass, chrome legs, 90cm diameter.",
          price: "3800", comparePrice: "6000",
          images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("furniture") ?? null, stock: 18, featured: false, badge: null,
        },
        {
          name: "Wardrobe 4-Door Sliding",
          description: "4-door sliding wardrobe. Mirror panels, multiple compartments, hanging rail included.",
          price: "15000", comparePrice: "22000",
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
          categoryId: catMap.get("furniture") ?? null, stock: 12, featured: false, badge: "Storage",
        },
        {
          name: "Dining Table Set 6-Seater",
          description: "6-seater dining table with chairs. Solid wood top, padded chairs, classic design.",
          price: "25000", comparePrice: "38000",
          images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("furniture") ?? null, stock: 6, featured: false, badge: "Set",
        },

        // ── Grocery ───────────────────────────────────────────────────────────
        {
          name: "Premium Basmati Rice 5kg",
          description: "Long-grain aged Basmati rice. Fragrant, non-sticky, perfect for biriyani and pulao.",
          price: "650", comparePrice: "850",
          images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("grocery") ?? null, stock: 500, featured: false, badge: "Popular",
        },
        {
          name: "Cold Pressed Mustard Oil 1L",
          description: "100% pure cold-pressed mustard oil. No additives, traditional wooden press method.",
          price: "280", comparePrice: "380",
          images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop"],
          categoryId: catMap.get("grocery") ?? null, stock: 300, featured: false, badge: "Organic",
        },
        {
          name: "Sunflower Honey 500g Pure",
          description: "Raw unfiltered sunflower honey. 100% natural, no artificial sweeteners, rich flavor.",
          price: "480", comparePrice: "700",
          images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop"],
          categoryId: catMap.get("grocery") ?? null, stock: 200, featured: false, badge: "Natural",
        },
        {
          name: "Organic Green Tea 100 Bags",
          description: "Premium organic green tea bags. Rich in antioxidants, light and refreshing flavor.",
          price: "350", comparePrice: "550",
          images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop"],
          categoryId: catMap.get("grocery") ?? null, stock: 400, featured: false, badge: "Healthy",
        },
        {
          name: "Mixed Dry Fruits 500g Premium Pack",
          description: "Cashews, almonds, raisins, walnuts. Premium quality, no added salt or sugar.",
          price: "900", comparePrice: "1300",
          images: ["https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=500&fit=crop"],
          categoryId: catMap.get("grocery") ?? null, stock: 150, featured: true, badge: "Premium",
        },
        {
          name: "Extra Virgin Olive Oil 750ml",
          description: "Cold-pressed extra virgin olive oil. First pressing, acidity <0.5%, ideal for salads.",
          price: "750", comparePrice: "1100",
          images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop"],
          categoryId: catMap.get("grocery") ?? null, stock: 200, featured: false, badge: "Imported",
        },
        {
          name: "Oats Quick Cook 1kg",
          description: "Rolled oats for quick cooking. High fiber, no added sugar, gluten-free option.",
          price: "220", comparePrice: "320",
          images: ["https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=500&h=500&fit=crop"],
          categoryId: catMap.get("grocery") ?? null, stock: 600, featured: false, badge: null,
        },
        {
          name: "Himalayan Pink Salt 1kg",
          description: "100% natural Himalayan pink salt. Mineral-rich, unrefined, food grade.",
          price: "180", comparePrice: "280",
          images: ["https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("grocery") ?? null, stock: 800, featured: false, badge: "Natural",
        },

        // ── Health & Personal Care ────────────────────────────────────────────
        {
          name: "Blood Pressure Monitor Digital",
          description: "Automatic upper arm BP monitor. Large LCD, irregular heartbeat detection, 2-user memory.",
          price: "2200", comparePrice: "3500",
          images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop"],
          categoryId: catMap.get("health") ?? null, stock: 60, featured: true, badge: "Medical",
        },
        {
          name: "Digital Thermometer Infrared",
          description: "No-touch infrared thermometer. 0.5-second reading, fever alarm, memory recall.",
          price: "850", comparePrice: "1400",
          images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop"],
          categoryId: catMap.get("health") ?? null, stock: 100, featured: false, badge: "Fast",
        },
        {
          name: "Multivitamin Tablets 60pcs Daily",
          description: "Complete daily multivitamin. 23 essential vitamins & minerals, no artificial colors.",
          price: "550", comparePrice: "900",
          images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop"],
          categoryId: catMap.get("health") ?? null, stock: 200, featured: false, badge: "Wellness",
        },
        {
          name: "Pulse Oximeter Fingertip",
          description: "Fingertip pulse oximeter. SpO2 + heart rate, OLED display, battery included.",
          price: "650", comparePrice: "1100",
          images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop"],
          categoryId: catMap.get("health") ?? null, stock: 80, featured: false, badge: null,
        },
        {
          name: "Vitamin C Effervescent Tablets 20s",
          description: "1000mg Vitamin C effervescent tablets. Immune support, orange flavor.",
          price: "280", comparePrice: "450",
          images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop"],
          categoryId: catMap.get("health") ?? null, stock: 300, featured: false, badge: "Immune",
        },
        {
          name: "Electric Toothbrush Sonic 32000rpm",
          description: "Sonic electric toothbrush. 32000 strokes/min, 5 cleaning modes, 2-min timer, USB charge.",
          price: "1800", comparePrice: "2900",
          images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop"],
          categoryId: catMap.get("health") ?? null, stock: 70, featured: true, badge: "Sonic",
        },
        {
          name: "First Aid Kit 100-piece Complete",
          description: "100-piece first aid kit. Bandages, antiseptic wipes, scissors, tweezers, in carry case.",
          price: "750", comparePrice: "1200",
          images: ["https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&h=500&fit=crop"],
          categoryId: catMap.get("health") ?? null, stock: 150, featured: false, badge: "Safety",
        },
        {
          name: "Massage Gun Deep Tissue 20-Speed",
          description: "Percussive therapy massage gun. 20 speed levels, 6 heads, 3200rpm, 8hr battery.",
          price: "3200", comparePrice: "5500",
          images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&h=500&fit=crop"],
          categoryId: catMap.get("health") ?? null, stock: 40, featured: true, badge: "Recovery",
        },

        // ── Automotive ────────────────────────────────────────────────────────
        {
          name: "Car Dash Camera 4K WiFi",
          description: "4K UHD dash cam with WiFi. 170° wide angle, night vision, loop recording, G-sensor.",
          price: "4500", comparePrice: "7000",
          images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=500&fit=crop"],
          categoryId: catMap.get("automotive") ?? null, stock: 35, featured: true, badge: "4K",
        },
        {
          name: "Car Vacuum Cleaner 12V Portable",
          description: "Portable 12V car vacuum. 120W suction, HEPA filter, 5-meter cord, multiple attachments.",
          price: "1200", comparePrice: "2000",
          images: ["https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=500&fit=crop"],
          categoryId: catMap.get("automotive") ?? null, stock: 80, featured: false, badge: "Portable",
        },
        {
          name: "Car Phone Holder Dashboard Magnetic",
          description: "Magnetic car phone holder. 360° rotation, strong magnet, dashboard & vent mount.",
          price: "450", comparePrice: "750",
          images: ["https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=500&h=500&fit=crop"],
          categoryId: catMap.get("automotive") ?? null, stock: 200, featured: false, badge: "Magnetic",
        },
        {
          name: "Car Air Purifier USB Ionizer",
          description: "USB car air purifier with negative ion generator. Removes dust, smoke, bad odors.",
          price: "650", comparePrice: "1100",
          images: ["https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500&h=500&fit=crop"],
          categoryId: catMap.get("automotive") ?? null, stock: 120, featured: false, badge: "Clean Air",
        },
        {
          name: "Tire Inflator Portable Electric",
          description: "Portable electric tire inflator. 150PSI, auto shut-off, digital display, LED light.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=500&h=500&fit=crop"],
          categoryId: catMap.get("automotive") ?? null, stock: 50, featured: false, badge: "Auto",
        },
        {
          name: "Car Seat Cover Set Universal",
          description: "Universal car seat cover set. 9-piece, waterproof PU leather, fits most sedan & SUV.",
          price: "2800", comparePrice: "4500",
          images: ["https://images.unsplash.com/photo-1616455579100-2ceaa4eb6d37?w=500&h=500&fit=crop"],
          categoryId: catMap.get("automotive") ?? null, stock: 45, featured: false, badge: "Full Set",
        },

        // ── More Electronics ──────────────────────────────────────────────────
        {
          name: "Mechanical Gaming Keyboard RGB",
          description: "TKL mechanical keyboard. Blue switches, per-key RGB, anti-ghosting, USB-C detachable.",
          price: "3200", comparePrice: "5200",
          images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 55, featured: true, badge: "Gaming",
        },
        {
          name: "USB-C Hub 7-in-1 Multiport",
          description: "7-in-1 USB-C hub. 4K HDMI, 100W PD, 3x USB-A, SD/TF card reader, plug and play.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1625314897518-bb4fe6e95229?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 90, featured: false, badge: "7-in-1",
        },
        {
          name: "Wireless Charging Pad 15W Fast",
          description: "15W fast wireless charging pad. Qi certified, compatible with iPhone & Android.",
          price: "850", comparePrice: "1400",
          images: ["https://images.unsplash.com/photo-1601997433577-9a4b46498cd5?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 120, featured: false, badge: "Fast",
        },
        {
          name: "Portable Power Bank 20000mAh",
          description: "20000mAh power bank. 65W PD fast charge, dual USB-A, 1 USB-C, digital display.",
          price: "2200", comparePrice: "3500",
          images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 80, featured: true, badge: "20000mAh",
        },
        {
          name: "Gaming Mouse 16000 DPI RGB",
          description: "16000 DPI gaming mouse. 7 programmable buttons, RGB lighting, 1ms response time.",
          price: "1500", comparePrice: "2400",
          images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 70, featured: false, badge: "Gaming",
        },
        {
          name: "4K Action Camera Waterproof 60fps",
          description: "4K 60fps action camera. Waterproof to 30m, image stabilization, WiFi, includes mount.",
          price: "5500", comparePrice: "8500",
          images: ["https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 30, featured: true, badge: "4K",
        },
        {
          name: "Smart LED Strip 5m RGB WiFi",
          description: "5m WiFi smart LED strip. 16M colors, app control, voice control, music sync.",
          price: "1200", comparePrice: "2000",
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
          categoryId: catMap.get("electronics") ?? null, stock: 100, featured: false, badge: "Smart",
        },

        // ── More Clothing ─────────────────────────────────────────────────────
        {
          name: "Formal Business Suit 2-Piece Men",
          description: "Tailored 2-piece formal suit. Slim fit, premium wool blend, jacket + trousers.",
          price: "5500", comparePrice: "8500",
          images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 30, featured: true, badge: "Formal",
        },
        {
          name: "Kameez Shalwar Eid Collection",
          description: "Premium cotton kameez shalwar. Embroidered collar, festival cut, sizes S to XXL.",
          price: "2200", comparePrice: "3500",
          images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 60, featured: true, badge: "Eid",
        },
        {
          name: "Hoodie Pullover Fleece Unisex",
          description: "Warm fleece pullover hoodie. Kangaroo pocket, adjustable drawstring, machine washable.",
          price: "1200", comparePrice: "1900",
          images: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 100, featured: false, badge: "Cozy",
        },
        {
          name: "Denim Jacket Classic Men",
          description: "Classic 100% cotton denim jacket. Button closure, chest pockets, regular fit.",
          price: "2800", comparePrice: "4500",
          images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 45, featured: false, badge: null,
        },
        {
          name: "Saree Silk Printed Ladies",
          description: "Premium silk printed saree. 6.5 meters, vibrant colors, elegant border, blouse piece included.",
          price: "3500", comparePrice: "5500",
          images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&h=500&fit=crop"],
          categoryId: catMap.get("clothing") ?? null, stock: 40, featured: true, badge: "Silk",
        },

        // ── More Watches ──────────────────────────────────────────────────────
        {
          name: "Smart Watch Fitness Tracker Pro",
          description: "Fitness smartwatch. Heart rate, SpO2, GPS, 7-day battery, 50m waterproof.",
          price: "4200", comparePrice: "6500",
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"],
          categoryId: catMap.get("watches") ?? null, stock: 50, featured: true, badge: "Smart",
        },
        {
          name: "Minimalist Leather Watch Unisex",
          description: "Ultra-thin minimalist watch. Genuine leather strap, Japanese quartz movement, 3ATM water resistant.",
          price: "2800", comparePrice: "4500",
          images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&h=500&fit=crop"],
          categoryId: catMap.get("watches") ?? null, stock: 40, featured: false, badge: "Minimal",
        },

        // ── More Beauty ───────────────────────────────────────────────────────
        {
          name: "Hair Dryer Ionic 2200W Salon",
          description: "Professional ionic hair dryer. 2200W, 3 heat settings, cool shot, concentrator nozzle.",
          price: "2200", comparePrice: "3500",
          images: ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 60, featured: true, badge: "Salon",
        },
        {
          name: "Lip Color Kit 12-Shade Matte",
          description: "12-shade long-lasting matte lip color kit. Waterproof, 8-hour wear, velvet finish.",
          price: "750", comparePrice: "1200",
          images: ["https://images.unsplash.com/photo-1586495777744-4e6b21534c06?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 120, featured: false, badge: "Kit",
        },
        {
          name: "Vitamin C Serum 30ml Anti-Aging",
          description: "20% Vitamin C brightening serum. Fades dark spots, boosts collagen, hyaluronic acid.",
          price: "1200", comparePrice: "1900",
          images: ["https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=500&fit=crop"],
          categoryId: catMap.get("beauty") ?? null, stock: 90, featured: true, badge: "Vitamin C",
        },

        // ── More Kids ─────────────────────────────────────────────────────────
        {
          name: "LEGO-Style Building Set 500pcs",
          description: "500-piece creative building block set. Compatible with major brands, STEM learning.",
          price: "1500", comparePrice: "2400",
          images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
          categoryId: catMap.get("kids") ?? null, stock: 80, featured: true, badge: "STEM",
        },
        {
          name: "Baby Walker Adjustable Safety",
          description: "Adjustable baby walker with safety harness. Non-slip wheels, toy tray, seat height adjustable.",
          price: "2800", comparePrice: "4500",
          images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&h=500&fit=crop"],
          categoryId: catMap.get("kids") ?? null, stock: 30, featured: false, badge: "Safety",
        },

        // ── More Sports ───────────────────────────────────────────────────────
        {
          name: "Dumbbell Set Adjustable 20kg",
          description: "Adjustable dumbbell set 2x10kg. Quick-lock mechanism, chrome knurled handle, space-saving.",
          price: "4500", comparePrice: "7000",
          images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 35, featured: true, badge: "Gym",
        },
        {
          name: "Treadmill Electric Foldable 1.5HP",
          description: "1.5HP electric foldable treadmill. 12 preset programs, LCD display, up to 10km/h.",
          price: "18000", comparePrice: "28000",
          images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 12, featured: true, badge: "Cardio",
        },
        {
          name: "Cycling Helmet MTB Adults",
          description: "Mountain bike helmet. 24-vent design, adjustable fit, EPS foam liner, CE certified.",
          price: "1800", comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1591638246754-93d3e1fbe61f?w=500&h=500&fit=crop"],
          categoryId: catMap.get("sports") ?? null, stock: 55, featured: false, badge: "Safety",
        },

        // ── More Home Appliances ──────────────────────────────────────────────
        {
          name: "Rice Cooker Digital 1.8L",
          description: "Digital 1.8L rice cooker. 8 cooking functions, keep warm, non-stick bowl, steam basket.",
          price: "3500", comparePrice: "5500",
          images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 65, featured: true, badge: "Digital",
        },
        {
          name: "Electric Kettle 1.7L Stainless Steel",
          description: "1.7L stainless steel electric kettle. 2200W, auto shut-off, boil-dry protection.",
          price: "1400", comparePrice: "2200",
          images: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 90, featured: false, badge: null,
        },
        {
          name: "Microwave Oven 20L Solo",
          description: "20L solo microwave oven. 700W, 5 power levels, digital timer, child lock.",
          price: "6500", comparePrice: "9500",
          images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null, stock: 30, featured: false, badge: null,
        },

        // ── Books ─────────────────────────────────────────────────────────────
        {
          name: "Bangla Novel Collection 5 Books",
          description: "5 bestselling Bangla novels set. Includes works by Humayun Ahmed and Taslima Nasrin.",
          price: "1200", comparePrice: "1800",
          images: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&h=500&fit=crop"],
          categoryId: catMap.get("books") ?? null, stock: 50, featured: true, badge: "Bestseller",
        },
        {
          name: "English Grammar Mastery",
          description: "Complete English grammar reference book. Covers all levels from basic to advanced.",
          price: "650", comparePrice: "1000",
          images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=500&fit=crop"],
          categoryId: catMap.get("books") ?? null, stock: 100, featured: false, badge: null,
        },
        {
          name: "Python Programming Full Guide",
          description: "Complete Python programming for beginners to advanced. 500+ practice problems.",
          price: "800", comparePrice: "1300",
          images: ["https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&h=500&fit=crop"],
          categoryId: catMap.get("books") ?? null, stock: 75, featured: false, badge: "Tech",
        },
        {
          name: "Children Story Book Set 10pcs",
          description: "10 colorful illustrated story books for children ages 3-8. Moral stories collection.",
          price: "900", comparePrice: "1500",
          images: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&h=500&fit=crop"],
          categoryId: catMap.get("books") ?? null, stock: 90, featured: false, badge: "Kids",
        },
        {
          name: "Self-Help & Motivation Bestseller",
          description: "Bangla translated motivational bestseller. Life-changing principles for success.",
          price: "450", comparePrice: "750",
          images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop"],
          categoryId: catMap.get("books") ?? null, stock: 150, featured: true, badge: "Popular",
        },
      ];

      const newProducts = allProducts.filter((p) => !existingNames.has(p.name));
      if (newProducts.length > 0) {
        await db.insert(productsTable).values(newProducts);
        logger.info(`Products seeded: ${newProducts.length} new products added (total target: 155+)`);
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
