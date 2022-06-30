import express, { Application } from "express";
import mongoose from "mongoose";
import router from "./router";
import dotenv from "dotenv";

const app: Application = express();

dotenv.config();
const dbEndpoint = process.env.DB_ENDPOINT || "";
mongoose.connect(dbEndpoint);
app.use(express.json());

app.use(router);

export default app;