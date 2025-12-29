import cron from "node-cron";
import { pool } from "../utils/db";

// 0 */1 * * * every one hour
cron.schedule("0 */1 * * *", async () => {
  console.log(`[Scheduler] Running Short urls expires_at TTL job`);
  try {
    await shortUrlTTLJob();
  } catch (error) {
    console.error("Error Running Short urls expires_at TTL job", error);
  }
});

async function shortUrlTTLJob() {
  try {
    const result = await pool.query(
      "UPDATE short_urls SET is_active = FALSE WHERE expires_at < NOW() "
    );
    console.log("[Scheduler] Updated URLS: ", result.rowCount);
  } catch (error) {
    console.error("Error Running Short urls expires_at TTL job: ", error);
    throw error;
  }
}
