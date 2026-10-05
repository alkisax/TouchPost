import mongoose from "mongoose";

export async function connectMongo(uri: string) {
  mongoose.set("strictQuery", false);

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
}
