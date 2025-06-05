import express from "express";
import {
  getCurrentAQ,
  getCurrentDataClimate,
  runPredict,
  saveCurrentCoordToJson,
} from "../controllers/apiController.js";
const router = express.Router();

router.get("/currentAQ", getCurrentAQ); // cái này nghĩa là kêu .../currentAQ sẽ kêu function getCurrentAQ
router.get("/currentDataClimate", getCurrentDataClimate);
router.post("/save-coord", saveCurrentCoordToJson);
router.post("/run-predict", runPredict);
export default router;
