import express, { Application } from "express";
import mongoose from "mongoose";
import router from "./router";

const app: Application = express();

mongoose.connect("mongodb://mongodb:27017/trackzy");
app.use(express.json());

app.use(router);

export default app;
