const mongoose = require("mongoose");
require("dotenv").config();
const mongooseConnection = async () => {
  try {
    const conn =await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
module.exports = mongooseConnection;
