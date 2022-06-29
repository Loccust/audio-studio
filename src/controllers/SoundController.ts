import { ISoundDto } from './../contracts/dtos/ISoundDto';
import { ITrack } from "./../contracts/entities/ISound";
import { ISound } from "../contracts/entities/ISound";
import { Request, Response } from "express";
import SoundService from "../services/SoundService";
import audioConfig from "../common/audio.config";
import S3Service from "../services/S3Service";
import SoundModel from "../data/models/SoundModel";
import SoundRepository from "../data/repositories/SoundRepository";

export default class SoundController {
  soundService: SoundService;
  s3Service: S3Service;

  constructor(soundService: SoundService, S3Service: S3Service) {
    this.soundService = soundService;
    this.s3Service = S3Service;
  }

  public async createSound(req: Request, res: Response) {
    const { duration, imageUri, tracks, title }:ISoundDto = JSON.parse(req.body.data) //req.body;
    console.log({ duration, imageUri, tracks, title })
    const multerFiles = req.files;

    const files = Array.isArray(multerFiles)
      ? multerFiles
      : multerFiles?.fieldname;

    if (!files || files.length === 0) {
      res.status(400).send("Files not provided.");
      return;
    }

    if (files?.length !== tracks?.length) {
      res
        .status(400)
        .send("The number of tracks is uncompatible with the files provided.");
      return;
    }

    const tracksContaisFilenames = files.every((file) =>
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

  // public async uploadS3(req: Request, res: Response) {
  //   const files = req.files;
  //   const upload = await this.s3Service.uploadFile({ files });
  //   res.json({ upload });
  // }

  // public async getFromS3(req: Request, res: Response) {
  //   const { filename } = req.params;
  //   console.log(filename);
  //   const file = await this.s3Service.getFileUrl(filename);
  //   res.json({ file });
  // }
}
