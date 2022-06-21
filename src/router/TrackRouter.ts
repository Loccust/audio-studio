import TrackController from "../controllers/TrackController";
import TrackService from "../services/TrackService";
import Router from "express";
import multer from "multer";
import S3Service from "../services/S3Service";

const trackRouter = Router();
const trackService = new TrackService();
const s3Service = new S3Service();
const trackController = new TrackController(trackService, s3Service);

// Middleware to upload files
const storage = multer.memoryStorage();
const fileFilter = (
  req: Router.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isAcceptedFile = file.mimetype === "audio/mpeg";
  cb(null, isAcceptedFile);
};
const upload = multer().array("channels");

trackRouter.get("/mix", (req, res) => trackController.createTrack(req, res));
trackRouter.get("/gets3/:filename", (req, res) => trackController.getFromS3(req, res));
trackRouter.post("/ups3", upload, (req, res) =>
  trackController.uploadS3(req, res)
);

export default trackRouter;
