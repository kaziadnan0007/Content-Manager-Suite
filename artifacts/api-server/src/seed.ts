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
        announcementText: "🔥 Special Offer: Order today — FREE delivery on orders ৳500+!",
      });
      logger.info("Site settings seeded for AcholGatha");
    }

    // Seed categories
    const existingCats = await db.select().from(categoriesTable).limit(1);
    if (existingCats.length === 0) {
      await db.insert(categoriesTable).values([
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
      ]);
      logger.info("Categories seeded");
    }

    // Seed products
    const existingProducts = await db.select().from(productsTable).limit(1);
    if (existingProducts.length === 0) {
      const cats = await db.select().from(categoriesTable);
      const catMap = new Map(cats.map((c) => [c.slug, c.id]));

      await db.insert(productsTable).values([
        // ── Electronics ──────────────────────────────────────────────────────
        {
          name: "Smartphone Pro Max 128GB",
          description: "Latest technology premium smartphone. 6.7-inch AMOLED display, 108MP triple camera, 5000mAh battery, 65W fast charging.",
          price: "18999",
          comparePrice: "24000",
          images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop"],
          categoryId: catMap.get("electronics") ?? null,
          stock: 50,
          featured: true,
          badge: "Best Seller",
        },
        {
          name: "Wireless Noise Cancelling Earbuds",
          description: "Premium ANC wireless earbuds. 30-hour battery life, IPX5 waterproof, crystal clear audio.",
          price: "2499",
          comparePrice: "4200",
          images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop"],
          categoryId: catMap.get("electronics") ?? null,
          stock: 100,
          featured: true,
          badge: "Hot Deal",
        },
        {
          name: "Ultrabook Laptop i7 16GB",
          description: "Intel Core i7 processor, 16GB RAM, 512GB SSD, 14-inch IPS display, backlit keyboard.",
          price: "55000",
          comparePrice: "68000",
          images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"],
          categoryId: catMap.get("electronics") ?? null,
          stock: 15,
          featured: true,
          badge: "Premium",
        },
        {
          name: "Portable Bluetooth Speaker",
          description: "360° deep bass portable speaker. 24-hour playback, waterproof design, perfect for outdoors.",
          price: "1999",
          comparePrice: "3200",
          images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop"],
          categoryId: catMap.get("electronics") ?? null,
          stock: 80,
          featured: false,
          badge: "New",
        },
        {
          name: "Fast Charging Power Bank 20000mAh",
          description: "20000mAh capacity, 65W PD fast charging support. Charge 3 devices simultaneously.",
          price: "1450",
          comparePrice: "2200",
          images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop"],
          categoryId: catMap.get("electronics") ?? null,
          stock: 120,
          featured: false,
          badge: "Sale",
        },
        {
          name: "10-inch WiFi Tablet",
          description: "10.1-inch FHD display tablet, 4GB RAM, 64GB storage, 8000mAh battery. Great for work & entertainment.",
          price: "12500",
          comparePrice: "16000",
          images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop"],
          categoryId: catMap.get("electronics") ?? null,
          stock: 25,
          featured: true,
          badge: "Hot",
        },

        // ── Watches ──────────────────────────────────────────────────────────
        {
          name: "Smart Fitness Watch Pro",
          description: "Heart rate, SpO2, stress monitoring smart watch. 1.43-inch AMOLED display, 14-day battery life.",
          price: "3999",
          comparePrice: "6000",
          images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop"],
          categoryId: catMap.get("watches") ?? null,
          stock: 60,
          featured: true,
          badge: "Popular",
        },
        {
          name: "Classic Analog Couple Watch",
          description: "Premium stainless steel bracelet classic design watch. Water resistant, elegant style.",
          price: "2200",
          comparePrice: "3500",
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"],
          categoryId: catMap.get("watches") ?? null,
          stock: 40,
          featured: false,
          badge: null,
        },

        // ── Clothing ─────────────────────────────────────────────────────────
        {
          name: "Designer Silk Saree",
          description: "Handwoven premium designer silk saree. Perfect for festivals and special occasions.",
          price: "3500",
          comparePrice: "5000",
          images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop"],
          categoryId: catMap.get("clothing") ?? null,
          stock: 30,
          featured: true,
          badge: "Exclusive",
        },
        {
          name: "Premium Cotton Panjabi",
          description: "100% pure cotton comfortable Panjabi. Available in multiple colors and sizes.",
          price: "899",
          comparePrice: "1400",
          images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4466?w=400&h=300&fit=crop"],
          categoryId: catMap.get("clothing") ?? null,
          stock: 200,
          featured: true,
          badge: "Top Pick",
        },
        {
          name: "Graphic T-Shirt Collection",
          description: "100% cotton premium graphic t-shirts. Available in various designs and sizes.",
          price: "499",
          comparePrice: "850",
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop"],
          categoryId: catMap.get("clothing") ?? null,
          stock: 300,
          featured: false,
          badge: null,
        },
        {
          name: "Three-Piece Salwar Kameez",
          description: "Printed three-piece salwar kameez set. Light and comfortable fabric, suitable for all seasons.",
          price: "1800",
          comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=400&h=300&fit=crop"],
          categoryId: catMap.get("clothing") ?? null,
          stock: 80,
          featured: true,
          badge: "Trending",
        },
        {
          name: "Slim Fit Jeans",
          description: "Premium stretch denim slim fit jeans. 5-pocket design, available in multiple shades.",
          price: "1100",
          comparePrice: "1800",
          images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop"],
          categoryId: catMap.get("clothing") ?? null,
          stock: 150,
          featured: false,
          badge: null,
        },

        // ── Beauty ───────────────────────────────────────────────────────────
        {
          name: "Natural Face Wash Kit",
          description: "Natural ingredients face wash and moisturizer combo pack. Suitable for all skin types.",
          price: "599",
          comparePrice: "950",
          images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop"],
          categoryId: catMap.get("beauty") ?? null,
          stock: 150,
          featured: false,
          badge: "Sale",
        },
        {
          name: "Hyaluronic Acid Moisturizer",
          description: "24-hour hydration premium moisturizer with SPF-30 sunscreen. Dermatologist tested.",
          price: "650",
          comparePrice: "1100",
          images: ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop"],
          categoryId: catMap.get("beauty") ?? null,
          stock: 120,
          featured: false,
          badge: null,
        },
        {
          name: "Matte Finish Lipstick 6-Piece Set",
          description: "Long-lasting matte finish lipstick set. 6 trendy shades in a beautiful gift box.",
          price: "750",
          comparePrice: "1200",
          images: ["https://images.unsplash.com/photo-1586495777744-4e6b0a2c5b06?w=400&h=300&fit=crop"],
          categoryId: catMap.get("beauty") ?? null,
          stock: 200,
          featured: true,
          badge: "Gift",
        },
        {
          name: "Premium Perfume EDT 100ml",
          description: "French fragrance technology premium perfume. 8-12 hours long-lasting scent.",
          price: "1800",
          comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=300&fit=crop"],
          categoryId: catMap.get("beauty") ?? null,
          stock: 60,
          featured: true,
          badge: "Luxury",
        },

        // ── Home Appliances ──────────────────────────────────────────────────
        {
          name: "Digital Rice Cooker Deluxe 3L",
          description: "3-litre capacity multifunction rice cooker with steam, slow cook and warm modes.",
          price: "2200",
          comparePrice: "3200",
          images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null,
          stock: 45,
          featured: false,
          badge: null,
        },
        {
          name: "High-Power Blender 1000W",
          description: "1000W motor professional blender. Perfect for smoothies, juices, soups and more.",
          price: "1800",
          comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=300&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null,
          stock: 35,
          featured: false,
          badge: null,
        },
        {
          name: "Memory Foam Pillow 2-Piece Set",
          description: "Orthopedic memory foam pillows. Improves sleep quality and reduces neck pain.",
          price: "950",
          comparePrice: "1500",
          images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop"],
          categoryId: catMap.get("home-appliances") ?? null,
          stock: 80,
          featured: false,
          badge: "Combo",
        },

        // ── Bags ─────────────────────────────────────────────────────────────
        {
          name: "Urban Backpack with Laptop Slot",
          description: "Waterproof backpack with 15.6-inch laptop slot. USB charging port, 30L capacity.",
          price: "1800",
          comparePrice: "2800",
          images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"],
          categoryId: catMap.get("bags") ?? null,
          stock: 60,
          featured: true,
          badge: "Trending",
        },
        {
          name: "Premium Leather Handbag",
          description: "Genuine leather premium handbag. Multiple compartments, detachable strap.",
          price: "3200",
          comparePrice: "5000",
          images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop"],
          categoryId: catMap.get("bags") ?? null,
          stock: 30,
          featured: true,
          badge: "Luxury",
        },

        // ── Shoes ────────────────────────────────────────────────────────────
        {
          name: "Air Cushion Running Shoes",
          description: "Air cushion technology premium running shoes. Breathable mesh upper, lightweight design.",
          price: "2500",
          comparePrice: "4000",
          images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"],
          categoryId: catMap.get("shoes") ?? null,
          stock: 70,
          featured: true,
          badge: "Hot",
        },
        {
          name: "Casual Leather Sandals",
          description: "Genuine leather casual sandals. Comfortable footbed, non-slip sole.",
          price: "1100",
          comparePrice: "1800",
          images: ["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop"],
          categoryId: catMap.get("shoes") ?? null,
          stock: 90,
          featured: false,
          badge: null,
        },

        // ── Sports ───────────────────────────────────────────────────────────
        {
          name: "Cricket Bat English Willow",
          description: "Grade-A English willow cricket bat. Full center profile, professional grade performance.",
          price: "2800",
          comparePrice: "4200",
          images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop"],
          categoryId: catMap.get("sports") ?? null,
          stock: 25,
          featured: false,
          badge: null,
        },
        {
          name: "Professional Football Size 5",
          description: "FIFA approved professional football. 32-panel design, durable PU leather.",
          price: "950",
          comparePrice: "1500",
          images: ["https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop"],
          categoryId: catMap.get("sports") ?? null,
          stock: 50,
          featured: false,
          badge: null,
        },
        {
          name: "Premium Yoga Mat 6mm",
          description: "6mm thick anti-slip yoga mat. Eco-friendly TPE material, carry bag included.",
          price: "799",
          comparePrice: "1300",
          images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"],
          categoryId: catMap.get("sports") ?? null,
          stock: 80,
          featured: false,
          badge: "Sale",
        },
      ]);
      logger.info("Products seeded (26 products)");
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
