import AudioService from "../services/audioService";
import { Request, Response } from "express";
import ITrack from "../common/dto/ITrack";

export default class AudioController {
 audioService: AudioService;
 audioPath: string = "audio";
  constructor(audioService: AudioService) {
    this.audioService = audioService;
  }
  
  public async getBitRate(req: Request, res: Response) {
    const fx = `${this.audioPath}/fx/fart-128kbps.mp3`;
    const bitRate = await this.audioService.getAudioBitRate(fx);
    res.json({ bitRate });
  }

  public async mixAudio(req: Request, res: Response) {
    const song = `${this.audioPath}/songs/conversation.mp3`;
    const fart = `${this.audioPath}/fx/fart-128kbps.mp3`;
    const boo = `${this.audioPath}/fx/boo-128kbps.mp3`;

    const tracks: ITrack[] = [
      { path: song, beginAt: 0, repeat: 0, volume: 0.99 },
      { path: fart, beginAt: 10, repeat: 2, volume: 0.50 },
      { path: boo, beginAt: 20, repeat: 0, volume: 0.1 },
    ];

    const mix = await this.audioService.mixAudios(tracks);
    res.json({ mix });
  }
}