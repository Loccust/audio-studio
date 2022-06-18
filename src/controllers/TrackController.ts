import { IChannel } from './../contracts/entities/ITrack';
import { ITrack } from "../contracts/entities/ITrack";
import { Request, Response } from "express";
import TrackService from "../services/TrackService";
import  audioConfig  from "../common/audio.config";

export default class TrackController {
  trackService: TrackService;

  constructor(trackService: TrackService) {
    this.trackService = trackService;
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
}