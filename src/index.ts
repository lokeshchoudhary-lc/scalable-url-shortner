import app from "./server";
import { pool } from "./utils/db";
import { getDatabaseInfo } from "./utils/db";
import { config } from "./core/config";

// Import cron jobs
import "./cron/short_url_TTL";

const HTTP_PORT = config.PORT;

async function startServer() {
  try {
    // Configuration already validated on import
    console.log("🔧 Using secure configuration...");

    // Add request logging middleware
    app.use((req, res, next) => {
      console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });

    // Check DB Connection and print detailed info
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully");
    await getDatabaseInfo(pool);

    const httpServer = app.listen(HTTP_PORT, "0.0.0.0", () => {
      console.log(`🚀 HTTP Server running on port ${HTTP_PORT}`);
    });

    // Graceful Shutdown for HTTP Server
    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, async () => {
        console.log(`Received ${signal}. Shutting down gracefully...`);
        try {
          // close the HTTP server to stop accepting new connections
          console.log("Closing HTTP server...");
          httpServer.close(() => {
            console.log("HTTP server closed");
          });

          // close database connections
          console.log("Closing database connection...");
          await pool.end();
          console.log("Database connections closed");

          // Exit with success code after a short delay to ensure logs are flushed
          await new Promise((resolve) => setTimeout(resolve, 100));
          console.log("Exiting process");
          process.exit(0);
        } catch (err) {
          console.error("Error during graceful shutdown:", err);
          process.exit(1);
        }
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
