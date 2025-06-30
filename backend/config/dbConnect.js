import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const DB_URI =
      process.env.NODE_ENV === "DEVELOPMENT"
        ? process.env.DB_LOCAL_URI
        : process.env.DB_URI;

    const con = await mongoose.connect(DB_URI);
    console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
