import AudioController from "./controllers/audioController.js";
import AudioService from "./services/audioService.js";
import Router from "express";

const router = Router();

const audioService = new AudioService();
const audioController = new AudioController(audioService);

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/bit-rate", audioController.getBitRate);
router.get("/mix", audioController.mixAudio);

export default router;
