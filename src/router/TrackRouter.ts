import TrackController from "../controllers/TrackController";
import TrackService from "../services/TrackService";
import Router from "express";

const trackRouter = Router();
const trackService = new TrackService();
const trackController = new TrackController(trackService);

trackRouter.get("/mix", (req, res) => trackController.createTrack(req, res));

export default trackRouter;