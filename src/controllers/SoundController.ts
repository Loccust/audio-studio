import { ISoundDto } from "./../contracts/dtos/ISoundDto";
import SoundService from "../services/SoundService";
import { Request, Response } from "express";

export default class SoundController {
  soundService: SoundService;

  constructor(soundService: SoundService) {
    this.soundService = soundService;
  }

  public async createSound(req: Request, res: Response) {
    const { duration, imageUri, tracks, title }: ISoundDto = JSON.parse(
      req.body.data
    ); //req.body;
    const multerFiles = req.files;

    const files = (
      Array.isArray(multerFiles) ? multerFiles : multerFiles?.fieldname
    ) as Express.Multer.File[];

    const tracksContaisFilenames = files?.every((file) =>
      tracks?.some((track) => file.originalname.includes(track.fileName))
    );
    if (!tracksContaisFilenames) {
      res.status(400).send("Inform in the tracks the filenames provided.");
      return;
    }

    const soundRes = this.soundService.createSound(
      {
        duration,
        imageUri,
        tracks,
        title,
      },
      files
    );
    res.json(soundRes);
  }

  async getSounds(req: Request, res: Response) {
    const soundRes = await this.soundService.getSounds();
    res.json(soundRes);
  }
}
