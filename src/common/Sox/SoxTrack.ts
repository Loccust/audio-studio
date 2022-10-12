import IMixResponse from "../../contracts/sox/IMixResponse";
import { ITrack } from "../../contracts/entities/ITrack";
import SoxIntegration from "./SoxIntegration";
import audioConfig from "../audio.config";

export default class SoxTrack {
  static tracks: ITrack[] = [];
  static soundDuration: number;
  static soundTitle: string;

  static async init(
    soundDuration: number,
    soundTitle: string,
    tracks: ITrack[]
  ) {
    this.soundDuration = soundDuration;
    this.soundTitle = soundTitle;
    this.tracks = tracks;
    return this;
  }

  private static async padTrack(track: ITrack): Promise<ITrack> {
    return new Promise(async (resolve, reject) => {
      if (!track.loop) return resolve(track);
      const filename = track.path.split("/").pop()?.replace(".mp3", "");
      const output = `${audioConfig.baseAudioDir}/output/temp/${filename}-pad.mp3`;
      SoxIntegration.pad(track.path, track.beginAt, output).then(
        (path) => {
          resolve({ ...track, path });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  private static async loopTrack(track: ITrack): Promise<ITrack> {
    return new Promise(async (resolve, reject) => {
      if (!track.loop) return resolve(track);
      const filename = track.path.split("/").pop()?.replace(".mp3", "");

      const offset = this.soundDuration - track.beginAt;
      const repeat = Math.floor(offset / track.duration);
      const rest = offset - repeat * track.duration;
      const hasToTrim = rest > 0;

      const output = `${audioConfig.baseAudioDir}/output/temp/${filename}-loop.mp3`;
      
      try {
        const loopPath = await SoxIntegration.loop(track.path, repeat, output);
        if (!hasToTrim) resolve({ ...track, path: loopPath });

        const outputTrim = `${audioConfig.baseAudioDir}/output/temp/${filename}-trim.mp3`;
        const outputLoopTrim = `${audioConfig.baseAudioDir}/output/temp/${filename}-loop-trim.mp3`;
        const splitAt = (rest / track.duration) * track.duration;
        
        const trimPath = await SoxIntegration.trim(loopPath, splitAt, outputTrim);
        const loopTrimPath = await SoxIntegration.concat(loopPath, trimPath, outputLoopTrim);
        resolve({ ...track, path: loopTrimPath });
      } catch(err){
        reject(err);
      }
    });
  }

  static async padMultiTracks() {
    if (this.tracks.length > 1) {
      this.tracks = await Promise.all(
        this.tracks.map((track: ITrack) => this.padTrack(track))
      );
    }
    return this;
  }

  static async loopMultiTracks() {
    this.tracks = await Promise.all(
      this.tracks.map((track: ITrack) => this.loopTrack(track))
    );
    return this;
  }

  static async mixTracks() {
    return new Promise<IMixResponse>((resolve, reject) => {
      const output = `${audioConfig.baseAudioDir}/output/${this.soundTitle}.mp3`;
      const trackArgs = ["-t", "mp3", "-v"];
      const mixArgs = ["-t", "mp3"];

      let tracksPathArgs: Array<string | number> = [this.tracks[0].path];
      this.tracks.slice(1).forEach((track) => {
        trackArgs.forEach((trackArg) => tracksPathArgs.push(trackArg));
        tracksPathArgs.push(track.volume);
        tracksPathArgs.push(track.path);
      });

      const args = [
        ...trackArgs,
        this.tracks[0].volume,
        "-m",
        ...tracksPathArgs,
        ...mixArgs,
        output,
      ];

      SoxIntegration.mix(args, output).then(
        (resOutput) => {
          const mixRes: IMixResponse = {
            mixedTracksPath: resOutput
          };
          resolve(mixRes);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}
