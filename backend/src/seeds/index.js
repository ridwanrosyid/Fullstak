import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const products = [
  {
    name: "Nasi Goreng",
    description:
      "Nasi goreng spesial dengan bumbu rempah pilihan, disajikan dengan telur mata sapi dan kerupuk.",
    price: 25000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://i0.wp.com/ptbamboe.com/wp-content/uploads/Picture-65.jpg?fit=1920%2C1080&ssl=1",
    ],
    averageRating: 4.8,
    totalReviews: 0,
  },
  {
    name: "Sate Ayam",
    description:
      "Sate ayam dengan bumbu kacang khas, potongan daging empuk dan aroma bakar yang menggugah selera.",
    price: 30000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://akcdn.detik.net.id/community/media/visual/2021/06/02/resep-sate-rembiga-ayam-khas-lombok_43.jpeg?w=700&q=90",
    ],
    averageRating: 4.7,
    totalReviews: 0,
  },
  {
    name: "Rendang",
    description:
      "Rendang daging sapi khas Padang, dimasak dengan santan dan bumbu rempah hingga kering dan beraroma.",
    price: 35000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://www.dapurkobe.co.id/wp-content/uploads/rendang-daging-360x240.jpg",
    ],
    averageRating: 4.9,
    totalReviews: 0,
  },
  {
    name: "Rawon",
    description:
      "Sup daging sapi hitam khas Surabaya dengan kuah gurih dan kaya rempah, disajikan dengan tauge dan sambal.",
    price: 67000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://cdn1-production-images-kly.akamaized.net/o9ov8eOmGxO0XGVS-4cutHn4kWM=/1200x675/smart/filters:quality(75):strip_icc():format(jpeg)/kly-media-production/medias/3117261/original/048100200_1588325749-030607000_1467613172-rawon-setan.jpg",
    ],
    averageRating: 4.6,
    totalReviews: 0,
  },
  {
    name: "Gado-Gado",
    description:
      "Gado-gado segar dengan sayuran rebus, telur, tahu, tempe, dan bumbu kacang yang lezat.",
    price: 20000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://cdn.grid.id/crop/0x0:0x0/filters:format(webp):quality(100)/photo/sasefoto/original/30130_variasi-cara-membuat-gado-gado-sesuai-lidah-dan-selera-orang-indonesia.jpg",
    ],
    averageRating: 4.5,
    totalReviews: 0,
  },
  {
    name: "Soto Ayam",
    description:
      "Soto ayam bening dengan suwiran ayam, bihun, dan taburan bawang goreng, hangat dan nikmat.",
    price: 18000,
    stock: 100,
    category: "Makanan",
    images: ["https://www.dapurkobe.co.id/wp-content/uploads/soto-ayam.jpg"],
    averageRating: 4.7,
    totalReviews: 0,
  },
  {
    name: "Mie Ayam",
    description:
      "Mie ayam dengan topping ayam kecap, sawi hijau, dan pangsit goreng, kuah gurih mendampingi.",
    price: 15000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReKD6C4VZQ36jXLBH1hyIIO21wnKlI4UgrTg&s",
    ],
    averageRating: 4.6,
    totalReviews: 0,
  },
  {
    name: "Pempek",
    description:
      "Pempek khas Palembang, terbuat dari ikan dan sagu, disajikan dengan cuko (kuah cuka) yang pedas asam.",
    price: 25000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://assets.unileversolutions.com/recipes-v3/258158-default.jpg?im=AspectCrop=(720,459);Resize=(720,459)",
    ],
    averageRating: 4.8,
    totalReviews: 0,
  },
  {
    name: "Bakso",
    description:
      "Bakso sapi kenyal dengan kuah kaldu hangat, mie, tahu, dan pelengkap sambal serta kecap.",
    price: 20000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8VdEITv0Gt4v1BTqw4FwdUsLMXm41aB3lmw&s",
    ],
    averageRating: 4.7,
    totalReviews: 0,
  },
  {
    name: "Ikan Bakar",
    description:
      "Ikan bakar dengan bumbu kecap dan rempah, disajikan dengan sambal terasi dan lalapan segar.",
    price: 40000,
    stock: 100,
    category: "Makanan",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1opGNiGZscx4PcWorqh0aANcJlzsPNHo2Ww&s",
    ],
    averageRating: 4.9,
    totalReviews: 0,
  },
  {
    name: "Es Teh Manis",
    description:
      "Es teh manis segar dengan rasa teh yang pas dan manisnya pas di tenggorokan.",
    price: 8000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://asset.kompas.com/crops/toOljW__-UqEVhGAJe8UyPdZWnU=/92x67:892x600/750x500/data/photo/2023/08/23/64e59deb79bfb.jpg",
    ],
    averageRating: 4.5,
    totalReviews: 0,
  },
  {
    name: "Wedang Jahe",
    description:
      "Wedang jahe hangat dengan campuran jahe, gula merah, dan rempah, cocok untuk cuaca dingin.",
    price: 10000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://asset.kompas.com/crops/jz6i2ey2ZWAe88uddpLpXBI8qY8=/147x0:990x562/1200x800/data/photo/2021/09/13/613f009db0057.jpg",
    ],
    averageRating: 4.8,
    totalReviews: 0,
  },
  {
    name: "Es Dawet",
    description:
      "Es dawet dengan cendol, santan, dan sirup gula merah, segar dan manis.",
    price: 12000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8oURSsL0XS6WHSCFUsOJZ6UQPNjHMZUPOdQ&s",
    ],
    averageRating: 4.7,
    totalReviews: 0,
  },
  {
    name: "Bandrek",
    description:
      "Bandrek minuman tradisional Sunda dari jahe, gula merah, dan rempah, hangat dan menyegarkan.",
    price: 11000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://img-global.cpcdn.com/recipes/8d5a35a0b20d55af/680x781f0.5_0.5_1.0q80/bandrek-susu-jahe-foto-resep-utama.jpg",
    ],
    averageRating: 4.6,
    totalReviews: 0,
  },
  {
    name: "Es Jeruk",
    description:
      "Es jeruk peras segar dengan rasa asam manis yang pas, sangat menyegarkan.",
    price: 7000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEcSGU1VLBBSbsoo4RgnNPMTZbt88jFuO6hg&s",
    ],
    averageRating: 4.4,
    totalReviews: 0,
  },
  {
    name: "Es Cincau",
    description:
      "Es cincau dengan potongan cincau hitam lembut, santan, dan sirup gula merah.",
    price: 9000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-CqPy0Y1CxbL3JRHPYwMlZy0ue12B7rdr8g&s",
    ],
    averageRating: 4.5,
    totalReviews: 0,
  },
  {
    name: "Bajigur",
    description:
      "Bajigur hangat dari santan, gula merah, dan jahe, dengan taburan kelapa parut dan kacang.",
    price: 12000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://asset.kompas.com/crops/Q8gAMW15GUuW65hkosrxWwThn2M=/111x83:735x499/1200x800/data/photo/2020/03/28/5e7eb826a19c9.jpg",
    ],
    averageRating: 4.7,
    totalReviews: 0,
  },
  {
    name: "Sekoteng",
    description:
      "Sekoteng minuman hangat dengan campuran jahe, kacang, roti, dan biji selasih, khas Betawi.",
    price: 15000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHgdId3AUh5nJJuzw_6udic-no95Ptj04znA&s",
    ],
    averageRating: 4.6,
    totalReviews: 0,
  },
  {
    name: "Bir Pletok",
    description:
      "Bir pletok minuman tradisional Betawi dari rempah-rempah seperti jahe, kayu manis, dan serai, tanpa alkohol.",
    price: 18000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://image.idn.media/post/20190518/13249808-1787122488185104-702827766-n-14d94bdbf1e7a586bdcc0d17dab1ca45.jpg",
    ],
    averageRating: 4.8,
    totalReviews: 0,
  },
  {
    name: "Kopi Susu",
    description:
      "Kopi susu dengan perpaduan kopi robusta dan susu kental manis, disajikan dengan es atau panas.",
    price: 15000,
    stock: 100,
    category: "Minuman",
    images: [
      "https://www.frisianflag.com/storage/app/media/uploaded-files/shutterstock_2309672981.jpg",
    ],
    averageRating: 4.9,
    totalReviews: 0,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert seed products
    await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${products.length} products`);

    // Display summary
    const categories = [...new Set(products.map((p) => p.category))];
    console.log("\n📊 Seeded Products Summary:");
    console.log(`Total Products: ${products.length}`);
    console.log(`Categories: ${categories.join(", ")}`);

    // Close connection
    await mongoose.connection.close();
    console.log("\n✅ Database seeding completed and connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
