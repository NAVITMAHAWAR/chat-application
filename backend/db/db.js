import mongoose from "mongoose";

const connectDB = async () => {
  try {
   
    const db = await mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log("Database is connected successfully");
    });
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
