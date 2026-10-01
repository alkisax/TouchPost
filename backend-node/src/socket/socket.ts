// backend\src\socket\socket.ts
// θα μπει σαν component στον server.ts κάνει όλες τις λειτουργίες του socket. Tο emit θα γίνει στο transaction.controller → create
/*
Αυτό το αρχείο:
δεν στέλνει events
δεν ξέρει τίποτα για transactions
δεν εξαρτάται από Express
Κάνει μόνο:
αρχικοποίηση socket.io πάνω σε http.Server
έλεγχο ADMIN auth
οργάνωση admins σε room
*/

/* eslint-disable no-console */
import type http from "http"; // το socket δουλεύει μόνο με http και πρέπει να το καλουμε. το Express δεν φτάνει
import { Server } from "socket.io";
import jwt from "jsonwebtoken"; // θα χρησιμοποιηθεί για auth ADMIN
import { organizationUserDAO } from '../login/dao/organizationUser.dao';

interface SocketJwtPayload {
  id: string;
  email: string;
  globalRoles: string[];
}

interface SocketUser extends SocketJwtPayload {
  organizationIds: string[];
}

let io: Server | null = null;

const allowedOrigins = [
  "http://localhost:5173",
  "http://91.99.145.154",
  "http://91.99.145.154:80",
  "http://localhost:8081",
  process.env.FRONTEND_URL,
  process.env.DEPLOY_URL,
  "https://eshop.portfolio-projects.space",
  "https://cafe.portfolio-projects.space",
].filter(Boolean) as string[];

// επειδή αυτό θα μπει σαν component στον server.ts παίρνει ένα server ως props
export const initSocket = (server: http.Server) => {
  if (io) {
    console.log("⚠️ Socket already initialized - skipping");
    return io;
  }

  // instantiate/αρχικοποίηση του socket.io μας απο την κλαση που φέρνουμε απο την βιβλιοθήκη
  io = new Server(server, {
    cors: {
      // Το cb είναι callback function που δίνει το socket.io. cb(error: Error | null, allow?: boolean. cb(null, true) → επιτρέπεται | cb(new Error(...), false) → κόβεται
      // ελέγχουμε οτι το socket γίνετε μονο απο τις εγκεκριμένες urls και μόνο με τις σχετικές μεθόδους
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error("Not allowed by Socket CORS"), false);
      },
      methods: ["GET", "POST"],
    },
  });

  // 1) Auth middleware (admin-only sockets) → με next γινόμαστε middleware. Εκτελείται: πριν γίνει connection, για κάθε socket
  io.use(async (socket, next) => {
    console.log("🧪 Socket auth attempt", socket.id);
    // console.log('🧪 handshake.auth:', socket.handshake.auth);
    try {
      // Όταν ανοίγει ένα socket connection, δεν είναι απλό event. Γίνεται ένα handshake (σαν HTTP request αρχικοποίησης). Σε αυτό το handshake περιέχονται:
      // πληροφορίες client / headers (μερικά) / query params / auth object (αν το στείλεις από frontend)
      // Από πού έρχεται το auth; Από το frontend: πχ io(backendUrl, {auth: {token: localStorage.getItem("token"),},})
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        console.log("❌ No token in socket auth");
        return next(new Error("Unauthorized"));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.log("❌ JWT_SECRET missing");
        return next(new Error("JWT_SECRET missing"));
      }

      // κάνουμε έλεγχο οτι το τοκεν που έρχεται απο το front είναι εγκεκριμένο (με τον ίδιο τρόπο που το κάνουμε και στο κανονικό auth)
      const payload = jwt.verify(token, secret) as SocketJwtPayload;
      console.log("🧪 Socket JWT payload:", payload);

      // Παιρνω τα roles για να ελέγχω αν admin
      const membership = await organizationUserDAO.readByUserId(payload.id);
      const organizationIds =
        membership && (membership.role === 'ADMIN' || membership.role === 'STAFF')
          ? [membership.organizationId]
          : [];

      if (organizationIds.length === 0) {
        console.log("❌ Socket user is not STAFF or ADMIN");
        return next(new Error("Forbidden"));
      }

      // Στο socket.io κάθε socket είναι ένα object που ζει όσο κρατάει η σύνδεση. Το socket έχει ιδιότητες όπως: socket.id / socket.handshake / socket.rooms / socket.data ← αυτό που μας ενδιαφέρει
      // «Αυτό το socket αντιστοιχεί σε αυτόν τον authenticated χρήστη» δεν ξανακάνεις auth
      socket.data.user = { ...payload, organizationIds };

      return next();
    } catch (err) {
      console.log("❌ Socket auth error", err);
      return next(new Error("Unauthorized"));
    }
  });

  // κατα την σύνδεση μπαίνει σε ένα δωμάτιο μόνο για admins
  console.log("🔌 Socket initialized, waiting for connections...");
  io.on("connection", (socket) => {
    console.log("🟣 Admin socket connected:", socket.id);
    const socketUser = socket.data.user as SocketUser | undefined;
    socketUser?.organizationIds.forEach((organizationId) => {
      socket.join(getOrganizationRoom(organizationId));
    });
    console.log(
      "👥 Admins in room:",
      socketUser?.organizationIds.length ?? 0,
    );
  });

  return io;
};

// το emit θα γίνει στο transaction.controller → create

export const getIO = () => {
  if (!io) {
    console.log("❌ getIO() called but io is NULL");
    throw new Error("Socket.io not initialized");
  }
  console.log("✅ getIO() OK");
  return io;
};

export const getOrganizationRoom = (organizationId: string) =>
  `organization:${organizationId}:admins`;
