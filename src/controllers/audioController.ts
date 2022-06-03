import AudioService from "../services/audioService";
import { Request, Response } from "express";

export default class AudioController {
 audioService: AudioService;
 audioPath: string = "src/audio";
  constructor(audioService: AudioService) {
    this.audioService = audioService;
  }
  
  public async getBitRate(req: Request, res: Response) {
    console.log(this)
    const fx = `${this.audioPath}/fx/fart-128kbps.mp3`;
    const bitRate = await this.audioService.getAudioBitRate(fx);
    res.json({ bitRate });
  }

  public async mixAudio(req: Request, res: Response) {
    const song = `${this.audioPath}/songs/conversation.mp3`;
    const fart = `${this.audioPath}/fx/fart-128kbps.mp3`;
    const boo = `${this.audioPath}/fx/boo-128kbps.mp3`;
    const songs = [song, fart, boo];
    const mix = await this.audioService.mixAudios(songs);
    res.json({ mix });
  }
}