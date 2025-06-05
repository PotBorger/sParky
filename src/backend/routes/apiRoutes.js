import express from "express";
import {
  getCurrentAQ,
  getCurrentDataClimate,
  runImpact,
  runPredict,
  runRadius,
  saveCurrentCoordToJson,
} from "../controllers/apiController.js";
const router = express.Router();

router.get("/currentAQ", getCurrentAQ); // cái này nghĩa là kêu .../currentAQ sẽ kêu function getCurrentAQ
router.get("/currentDataClimate", getCurrentDataClimate);
router.post("/save-coord", saveCurrentCoordToJson);
router.post("/run-predict", runPredict);
router.post("/run-impact", runImpact);
router.post("/run-radius", runRadius);
export default router;
