import express from "express";
import { getCurrentAQ } from "../controllers/apiController.js";

const router = express.Router();

router.get("/currentAQ", getCurrentAQ); // cái này nghĩa là kêu .../currentAQ sẽ kêu function getCurrentAQ

export default router;
