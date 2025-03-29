import { startScheduler, stopScheduler } from "./utils/scheduler";

import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import protocolRoutes from "./routes/dataRoutes";
import { scheduleDataFetching } from "./scripts/fetchLlamaData";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/protocols", protocolRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start the data sync scheduler
  startScheduler();

  // Initialize DeFi Llama data fetching
  if (process.env.ENABLE_DEFILLAMA_SYNC !== "false") {
    console.log("Initializing DeFi Llama data synchronization...");
    scheduleDataFetching();
  }
});

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  console.log("Shutting down server...");

  // Stop the scheduler
  stopScheduler();

  // Close database connection
  await prisma.$disconnect();
  console.log("Disconnected from database");

  // Close server
  server.close(() => {
    console.log("Server shut down");
    process.exit(0);
  });
});

export { prisma };
