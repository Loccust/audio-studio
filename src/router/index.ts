import { Router } from "express";
import TrackRouter from "./TrackRouter";

const router = Router();
router.use("/track", TrackRouter);

export default router;