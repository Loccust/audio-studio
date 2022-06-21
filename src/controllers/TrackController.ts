import { IChannel } from "./../contracts/entities/ITrack";
import { ITrack } from "../contracts/entities/ITrack";
import { Request, Response } from "express";
import TrackService from "../services/TrackService";
import audioConfig from "../common/audio.config";
import S3Service from "../services/S3Service";

export default class TrackController {
  trackService: TrackService;
  s3Service: S3Service;

  constructor(trackService: TrackService, S3Service: S3Service) {
    this.trackService = trackService;
    this.s3Service = S3Service;
  }

  public async createTrack(req: Request, res: Response) {
    const song = `${audioConfig.baseAudioDir}/songs/conversation.mp3`;
    const fart = `${audioConfig.baseAudioDir}/fx/fart-128kbps.mp3`;
    const boo = `${audioConfig.baseAudioDir}/fx/boo-128kbps.mp3`;

    const channels: IChannel[] = [
      { path: song, beginAt: 0, repeat: 0, volume: 0.99 },
      { path: fart, beginAt: 10, repeat: 2, volume: 0.5 },
      { path: boo, beginAt: 20, repeat: 0, volume: 0.1 },
    ];

    const mix = await this.trackService.mixChannels(channels);
    res.json({ mix });
  }

  public async uploadS3(req: Request, res: Response) {
    const files = req.files;
    const upload = await this.s3Service.uploadFile({ files });
    res.json({ upload });
  }

  public async getFromS3(req: Request, res: Response) {
    const { filename } = req.params;
    console.log(filename);
    const file = await this.s3Service.getFileUrl(filename);
    res.json({ file });
  }
}
