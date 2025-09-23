const mongoose = require("mongoose");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");

const createAdminUser = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const adminUser = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@rithu.com",
    phoneNumber: "1234567890",
    bankName: "Admin Bank",
    bankBranch: "Admin Branch",
    bankAccountNo: "0000000000",
    password: "admin123",
    role: "superadmin",
  };

  const existingAdmin = await User.findOne({ email: adminUser.email });
  if (!existingAdmin) {
    await User.create(adminUser);
    console.log("Admin user created successfully");
  } else {
    console.log("Admin user already exists");
  }

  await mongoose.disconnect();
};

createAdminUser();
