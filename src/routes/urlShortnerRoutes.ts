import express, { RequestHandler } from "express";
import { pool } from "../utils/db";
import {
  helloworld,
  createShortUrl,
  redirectUrl,
  getShortUrlInfo,
  createBatchUrl,
} from "../controllers/urlShortnerController";
const router = express.Router();

/**
 * @route GET /
 * @desc Get Hello World
 */
router.get("/", ((req, res, next) => {
  console.log("GET / endpoint hit");
  helloworld(req, res);
}) as RequestHandler);

/**
 * @route POST /short_url
 * @desc Create a short url by providing long_url and expires_in_days
 */
router.post("/short_url", ((req, res, next) => {
  console.log("POST /short_url endpoint hit");
  createShortUrl(pool)(req, res).catch(next);
}) as RequestHandler);

/**
 * @route GET /:slug
 * @desc Redirect to long_url from the slug
 */
router.get("/:slug", ((req, res, next) => {
  console.log("GET /:slug endpoint hit");
  redirectUrl(pool)(req, res).catch(next);
}) as RequestHandler);

/**
 * @route GET /url_info/:slug
 * @desc Retrive full info about url from slug
 */
router.get("/url_info/:slug", ((req, res, next) => {
  console.log("GET /url_info/:slug endpoint hit");
  getShortUrlInfo(pool)(req, res).catch(next);
}) as RequestHandler);

/**
 * @route POST /batch_urls
 * @desc Create Multiple short urls from provided urls array
 */
router.post("/batch_urls", ((req, res, next) => {
  console.log("POST /batch_urls endpoint hit");
  createBatchUrl(pool)(req, res).catch(next);
}) as RequestHandler);

export default router;
