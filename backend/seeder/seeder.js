import mongoose from "mongoose";
import dotenv from "dotenv";
import products from "./data.js";
import Product from "../models/product.js";

// Load environment variables
dotenv.config({ path: "../config/config.env" });

// Connect to the database
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Seed the database with products
const seedProducts = async () => {
  try {
    await Product.deleteMany();
    console.log("Products are deleted");

    await Product.insertMany(products);
    console.log("Products are added");

    process.exit();
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

// Execute the seeder script
const runSeeder = async () => {
  await connectDatabase();
  await seedProducts();
};

runSeeder();
