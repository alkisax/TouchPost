// backend\src\server.ts
/* eslint-disable no-console */
import 'dotenv/config';
import { app } from "./app";
import { consts } from "./config/constants";
import { connectMongo } from "./config/mongo";
import http from "http";
import { initSocket } from "./socket/socket";

const main = async () => {
  if (!consts.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  // socket
  const server = http.createServer(app);
  initSocket(server);

  await connectMongo(consts.env.MONGO_URI);

  server.listen(consts.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${consts.env.PORT}`);
    console.log(`📚 Swagger at http://localhost:${consts.env.PORT}/api-docs`);
  });
};

main().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
