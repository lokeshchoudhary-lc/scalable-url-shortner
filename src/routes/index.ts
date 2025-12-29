import { Router } from "express";
import urlShortnerRoutes from "./urlShortnerRoutes";

const router = Router();

router.use("/", urlShortnerRoutes);

export default router;
