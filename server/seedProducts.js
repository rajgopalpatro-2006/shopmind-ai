const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

// =========================================================
// SHOPMIND AI - PRODUCT SEED DATA
// =========================================================

const products = [
  {
    name: "MacBook Air M4",
    category: "Laptop",
    price: 99900,
    icon: "💻",
    image: "/products/macbook-air-m4.png",
    rating: 4.8,
    stock: 10,
    description:
      "Powerful and lightweight laptop suitable for programming, development and everyday work.",
  },

  {
    name: "Samsung Galaxy S25",
    category: "Smartphone",
    price: 74999,
    icon: "📱",
    image: "/products/samsung-galaxy-s25.png",
    rating: 4.7,
    stock: 15,
    description:
      "Premium smartphone with powerful performance, excellent display and advanced camera features.",
  },

  {
    name: "Sony WH-1000XM5",
    category: "Headphones",
    price: 29990,
    icon: "🎧",
    image: "/products/sony-wh-1000xm5.png",
    rating: 4.6,
    stock: 20,
    description:
      "Premium wireless headphones with excellent noise cancellation and high-quality sound.",
  },

  {
    name: "Apple Watch Series 10",
    category: "Smartwatch",
    price: 46900,
    icon: "⌚",
    image: "/products/apple-watch-series-10.png",
    rating: 4.7,
    stock: 12,
    description:
      "Smartwatch with fitness tracking, notifications and a premium design.",
  },

  {
    name: "ASUS ROG Gaming Laptop",
    category: "Laptop",
    price: 89990,
    icon: "💻",
    image: "/products/asus-rog-gaming-laptop.png",
    rating: 4.5,
    stock: 8,
    description:
      "High-performance gaming laptop designed for gaming, programming and demanding applications.",
  },

  {
    name: "OnePlus 13",
    category: "Smartphone",
    price: 69999,
    icon: "📱",
    image: "/products/oneplus-13.png",
    rating: 4.6,
    stock: 18,
    description:
      "Fast and powerful smartphone with a premium display and excellent overall performance.",
  },
];

// =========================================================
// SEED PRODUCTS
// =========================================================

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully ✅");

    await Product.deleteMany({});

    console.log("Old products removed.");

    await Product.insertMany(products);

    console.log("6 products added successfully 🎉");
  } catch (error) {
    console.error("Error adding products:");
    console.error(error.message);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed.");

    process.exit();
  }
};

seedProducts();