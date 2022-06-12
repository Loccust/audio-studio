import AudioController from "./controllers/audioController";
import AudioService from "./services/audioService";
import Router from "express";

const router = Router();

const audioService = new AudioService();
const audioController = new AudioController(audioService);

router.get("/bit-rate", (req, res) => audioController.getBitRate(req, res));
router.get("/mix", (req, res) => audioController.mixAudio(req, res));

export default router;