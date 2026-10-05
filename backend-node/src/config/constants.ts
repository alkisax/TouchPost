// backend\src\config\constants.ts
import dotenv from "dotenv";
dotenv.config();

// if (!process.env.OPENAI_API_KEY) {
//   throw new Error("OPENAI_API_KEY missing");
// }

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI missing");
}

export const consts = {
  env: {
    PORT: Number(process.env.PORT || 3010),
    MONGO_URI: process.env.MONGO_URI,
    // OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};
