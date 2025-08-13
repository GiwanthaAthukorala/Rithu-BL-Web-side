require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/userAdmin");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // Check if admin exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
      role: { $in: ["admin", "superadmin"] },
    });
    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      return;
    }

    // Create admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: hashedPassword,
      role: "superadmin",
      isAdmin: true,
      isVerified: true,
      // Skip regular user required fields since this is an admin
    });

    console.log("Admin user created successfully:");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role: ${admin.role}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
