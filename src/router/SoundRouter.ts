import SoundRepository from "../data/repositories/SoundRepository";
import SoundController from "../controllers/SoundController";
import SoundService from "../services/SoundService";
import fileFilter from "../middlewares/fileFilter";
import Router from "express";
import multer from "multer";

const soundRouter = Router();

const soundRepository = new SoundRepository();
const soundService = new SoundService(soundRepository);
const soundController = new SoundController(soundService);

const upload = multer({fileFilter}).array("tracks");
soundRouter.post("/", upload, (req, res) => soundController.createSound(req, res));
soundRouter.get("/", (req, res) => soundController.getSounds(req, res));

export default soundRouter;