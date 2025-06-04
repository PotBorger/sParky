import express from "express";
import {
  getCurrentAQ,
  getCurrentDataClimate,
} from "../controllers/apiController.js";
import { writeFile } from "fs/promises";
const router = express.Router();

router.get("/currentAQ", getCurrentAQ); // cái này nghĩa là kêu .../currentAQ sẽ kêu function getCurrentAQ
router.get("/currentDataClimate", getCurrentDataClimate);
router.post("/save-coord", async (req, res) => {
  try {
    const { lon, lat } = req.body;
    const currentCoordObject = { currentLon: lon, currentLat: lat };
    const jsonString = JSON.stringify(currentCoordObject, null, 2);

    // write to a .json file (you can choose any path you like)
    await writeFile("./currentCoord.json", jsonString, "utf8");
    return res.json({ success: true });
  } catch (err) {
    console.error("Error writing file:", err);
    return res.status(500).json({ error: "Failed to write file" });
  }
});
export default router;
