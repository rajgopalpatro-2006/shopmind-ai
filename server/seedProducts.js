const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const products = [
  {
    name: "MacBook Air M4",
    category: "Laptop",
    price: 99900,
    icon: "💻",
    rating: 4.8,
    description:
      "Powerful and lightweight laptop suitable for programming, development and everyday work.",
  },

  {
    name: "Samsung Galaxy S25",
    category: "Smartphone",
    price: 74999,
    icon: "📱",
    rating: 4.7,
    description:
      "Premium smartphone with powerful performance, excellent display and advanced camera features.",
  },

  {
    name: "Sony WH-1000XM5",
    category: "Headphones",
    price: 29990,
    icon: "🎧",
    rating: 4.6,
    description:
      "Premium wireless headphones with excellent noise cancellation and high-quality sound.",
  },

  {
    name: "Apple Watch Series 10",
    category: "Smartwatch",
    price: 46900,
    icon: "⌚",
    rating: 4.7,
    description:
      "Smartwatch with fitness tracking, notifications and a premium design.",
  },

  {
    name: "ASUS ROG Gaming Laptop",
    category: "Laptop",
    price: 89990,
    icon: "💻",
    rating: 4.5,
    description:
      "High-performance gaming laptop designed for gaming, programming and demanding applications.",
  },

  {
    name: "OnePlus 13",
    category: "Smartphone",
    price: 69999,
    icon: "📱",
    rating: 4.6,
    description:
      "Fast and powerful smartphone with a premium display and excellent overall performance.",
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully ✅");

    // Remove existing products first
    await Product.deleteMany({});

    console.log("Old products removed.");

    // Add new products
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