import { Request, Response } from "express";
import { Pool } from "pg";
import { generateSlug } from "../utils/slug";
import { config } from "../core/config";

export const helloworld = (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Hello World" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createShortUrl =
  (pool: Pool) => async (req: Request, res: Response) => {
    const { long_url, expires_in_days } = req.body;

    if (!long_url) {
      return res.status(400).json({ error: "long_url is required" });
    }

    try {
      //Generate the next counter for slug
      const seqResult = await pool.query(
        "SELECT nextval('short_url_counter_seq') as counter"
      );
      const counter = seqResult.rows[0].counter;

      //Generate the slug from counter value
      const slug = generateSlug(counter);

      // Calculate expiration
      const expires_at = expires_in_days
        ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
        : new Date(
            Date.now() + config.DEFAULT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
          );

      //Insert the data into short_urls table
      await pool.query(
        `INSERT INTO short_urls (counter,slug,long_url,expires_at)
          VALUES ($1,$2,$3,$4)`,
        [counter, slug, long_url, expires_at]
      );

      res.status(201).json({
        short_url: `${config.BASE_URL}/${slug}`,
      });
    } catch (error) {
      console.error("Error Creating short URL :", error);
      res.status(500).json({ error: "Failed to create short URL" });
    }
  };

export const redirectUrl =
  (pool: Pool) => async (req: Request, res: Response) => {
    const { slug } = req.params;

    try {
      const result = await pool.query(
        "SELECT long_url FROM short_urls WHERE slug = $1",
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "URL not found or expired" });
      }

      //Increment the click count of short url
      pool
        .query(
          "UPDATE short_urls SET click_count = click_count + 1 WHERE slug = $1 ",
          [slug]
        )
        .catch((error) => {
          console.error("Error Updating short URL Click Count :", error);
        });

      const long_url = result.rows[0].long_url;

      res.redirect(302, long_url);
    } catch (error) {
      console.error("Error redirecting:", error);
      res.status(500).json({ message: "Failed to Redirect" });
    }
  };

export const getShortUrlInfo =
  (pool: Pool) => async (req: Request, res: Response) => {
    const { slug } = req.params;

    try {
      const result = await pool.query(
        `SELECT slug, long_url, click_count, created_at, expires_at 
            FROM short_urls WHERE slug = $1`,
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "URL not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Failed to get short URL Info", error);
      res.status(500).json({ message: "Failed to get short URL Info" });
    }
  };

export const createBatchUrl =
  (pool: Pool) => async (req: Request, res: Response) => {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "urls array is required" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const results = [];

      for (const urlData of urls) {
        const seqResult = await pool.query(
          "SELECT nextval('short_url_counter_seq') as counter"
        );
        const counter = seqResult.rows[0].counter;

        const slug = generateSlug(counter);

        const expires_at = urlData.expires_in_days
          ? new Date(Date.now() + urlData.expires_in_days * 24 * 60 * 60 * 1000)
          : new Date(
              Date.now() + config.DEFAULT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
            );

        await client.query(
          `INSERT INTO short_urls (counter,slug,long_url,expires_at)
          VALUES ($1,$2,$3,$4)`,
          [counter, slug, urlData.long_url, expires_at]
        );

        results.push({
          short_url: `${config.BASE_URL}/${slug}`,
          long_url: urlData.long_url,
        });
      }

      await client.query("COMMIT");
      res.status(201).json({ urls: results });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to create batch URLS: ", error);
      res.status(500).json({ message: "Failed to create batch URLS" });
    } finally {
      client.release();
    }
  };
