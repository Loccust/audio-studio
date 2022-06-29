import SoundRouter from "./SoundRouter";
import { Router } from "express";

const router = Router();
router.use("/sound", SoundRouter);

export default router;