const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function checkAndFix() {
  try {
    await mongoose.connect("mongodb://localhost:27017/designden");
    console.log("MongoDB connected");

    // Check admin user
    const admin = await mongoose.connection.db
      .collection("users")
      .findOne({ email: "admin@designden.com" });
    if (admin) {
      console.log("\nAdmin user found:");
      console.log("  Email:", admin.email);
      console.log("  Role:", admin.role);
      console.log("  Has password:", !!admin.password);

      // Test password
      const match = await bcrypt.compare("Admin@123", admin.password);
      console.log('  Password "Admin@123" matches:', match);

      if (!match) {
        console.log("\n  Resetting admin password...");
        const newHash = await bcrypt.hash("Admin@123", 10);
        await mongoose.connection.db
          .collection("users")
          .updateOne(
            { email: "admin@designden.com" },
            { $set: { password: newHash } },
          );
        console.log("  Admin password reset to: Admin@123");
      }
    } else {
      console.log("Admin user not found!");
    }

    // Check designer user
    const designer = await mongoose.connection.db
      .collection("users")
      .findOne({ email: "designer@designden.com" });
    if (designer) {
      console.log("\nDesigner user found:");
      console.log("  Email:", designer.email);
      const match = await bcrypt.compare("Admin@123", designer.password);
      console.log('  Password "Admin@123" matches:', match);

      if (!match) {
        console.log("  Resetting designer password...");
        const newHash = await bcrypt.hash("Admin@123", 10);
        await mongoose.connection.db
          .collection("users")
          .updateOne(
            { email: "designer@designden.com" },
            { $set: { password: newHash } },
          );
        console.log("  Designer password reset to: Admin@123");
      }
    }

    // Check priya designer
    const priya = await mongoose.connection.db
      .collection("users")
      .findOne({ email: "priya.designer@example.com" });
    if (priya) {
      console.log("\nPriya designer found:");
      console.log("  Email:", priya.email);
      const match = await bcrypt.compare("Designer@123", priya.password);
      console.log('  Password "Designer@123" matches:', match);

      if (!match) {
        console.log("  Resetting priya password...");
        const newHash = await bcrypt.hash("Designer@123", 10);
        await mongoose.connection.db
          .collection("users")
          .updateOne(
            { email: "priya.designer@example.com" },
            { $set: { password: newHash } },
          );
        console.log("  Priya password reset to: Designer@123");
      }
    }

    console.log("\nDone!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkAndFix();
