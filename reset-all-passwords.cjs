const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function resetPasswords() {
  try {
    await mongoose.connect("mongodb://localhost:27017/designden");
    console.log("MongoDB connected");

    const newHash = await bcrypt.hash("Admin@123", 10);

    // Reset admin
    await mongoose.connection.db
      .collection("users")
      .updateOne(
        { email: "admin@designden.com" },
        { $set: { password: newHash } },
      );
    console.log("✅ admin@designden.com password reset to: Admin@123");

    // Reset designer
    await mongoose.connection.db
      .collection("users")
      .updateOne(
        { email: "designer@designden.com" },
        { $set: { password: newHash } },
      );
    console.log("✅ designer@designden.com password reset to: Admin@123");

    // Reset manager
    await mongoose.connection.db
      .collection("users")
      .updateOne(
        { email: "manager@designden.com" },
        { $set: { password: newHash } },
      );
    console.log("✅ manager@designden.com password reset to: Admin@123");

    // Reset customer
    await mongoose.connection.db
      .collection("users")
      .updateOne(
        { email: "customer@designden.com" },
        { $set: { password: newHash } },
      );
    console.log("✅ customer@designden.com password reset to: Admin@123");

    await mongoose.disconnect();
    console.log("\nDone! All passwords are now: Admin@123");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

resetPasswords();
