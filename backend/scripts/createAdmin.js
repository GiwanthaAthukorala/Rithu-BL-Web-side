require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/userAdmin");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  try {
    // Connect to admin database
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "rithu_admin",
    });

    // Check if admin exists
    const existingAdmin = await Admin.findOne({
      email: process.env.ADMIN_EMAIL,
    });
    if (existingAdmin) {
      console.log("Admin already exists:");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      return;
    }

    // Create admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_INITIAL_PASSWORD,
      salt
    );

    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL,
      username: "superadmin",
      password: hashedPassword,
      role: "superadmin",
      permissions: ["manage_all"],
    });

    console.log("Admin created successfully:");
    console.log(`Email: ${admin.email}`);
    console.log(`Initial Password: ${process.env.ADMIN_INITIAL_PASSWORD}`);
    console.log("Please change this password immediately after first login.");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
