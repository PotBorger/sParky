import express from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";
import fs from "fs/promises";

const app = express();

app.use(cors());

app.use(express.json()); // Parse incoming JSON

// Routes
app.use("/api", apiRoutes); //endpoint is now /api/... based on the routes in apiRoutes => kết nối với cái
// kia thì nó thành /api/curentAQ

export default app;
