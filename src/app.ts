import express, { Application } from "express";
import dbconfig from "./data/db.config";
import mongoose from "mongoose";
import router from "./router";
import dotenv from "dotenv";

const app: Application = express();

dotenv.config();
// mongoose.connect(dbconfig.uri);
app.use(express.json());

app.use(router);

export default app;