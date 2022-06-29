import SoundController from "../controllers/SoundController";
import SoundService from "../services/SoundService";
import fileFilter from "../middlewares/fileFilter";
import S3Service from "../services/S3Service";
import Router from "express";
import multer from "multer";
import SoundRepository from "../data/repositories/SoundRepository";

const soundRouter = Router();
const soundRepository = new SoundRepository();
const soundService = new SoundService(soundRepository);
const s3Service = new S3Service();
const soundController = new SoundController(soundService, s3Service);
// const storage = multer.memoryStorage();
const upload = multer().array("tracks");

soundRouter.post("/", upload, (req, res) => soundController.createSound(req, res));

export default soundRouter;