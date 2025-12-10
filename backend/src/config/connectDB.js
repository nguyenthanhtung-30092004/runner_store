const mongoose = require("mongoose");

require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Kết nối thành công cơ sở dữ liệu");
  } catch (error) {
    console.log("Kết nối thất bại cơ sở dữ liệu", error);
    process.exit(1);
  }
};

module.exports = connectDB;
