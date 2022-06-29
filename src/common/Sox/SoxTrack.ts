import IMixResponse from "../../contracts/sox/IMixResponse";
import { ITrack } from "../../contracts/entities/ISound";
import SoxIntegration from "./SoxIntegration";
import audioConfig from "../audio.config";

export default class SoxTrack {
  static loopedTrackPaths: string[] = [];
  static padTrackPaths: string[] = [];
  static tracks: ITrack[] = [];

  static async init(tracks: ITrack[]) {
    this.tracks = tracks;
    return this;
  }

  private static async padTrack(track: ITrack): Promise<ITrack> {
    return new Promise(async (resolve, reject) => {
      if (!track.loop) return resolve(track);
      const filename = track.path.split("/").pop()?.replace(".mp3", "");
      const output = `${audioConfig.baseAudioDir}/output/temp/tracks/${filename}-pad.mp3`;
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
      const output = `${audioConfig.baseAudioDir}/output/temp/${filename}-loop.mp3`;
      const repeat = 2; //total - beginAt / trackduration
      const isDecimal = (num: number) => !!(num % 1);
      
      //trim -> if(isDecimal)
      //concat
      SoxIntegration.loop(track.path, repeat, output).then(
        (path) => {
          resolve({ ...track, path });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  static async padMultiTracks() {
    if (this.tracks.length > 1) {
      this.tracks = await Promise.all(
        this.tracks.map((track: ITrack) => this.padTrack(track))
      );
      this.padTrackPaths = this.tracks
        .map((track: ITrack) => track.path)
        ?.filter((path) => path.includes("temp"));
    }
    return this;
  }

  static async loopMultiTracks() {
    this.tracks = await Promise.all(
      this.tracks.map((track: ITrack) => this.loopTrack(track))
    );
    this.loopedTrackPaths = this.tracks
      .map((track: ITrack) => track.path)
      ?.filter((path) => path.includes("temp"));
    return this;
  }

  static async mixTracks() {
    return new Promise<IMixResponse>((resolve, reject) => {
      const output = `${audioConfig.baseAudioDir}/output/out.mp3`;
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
            mixedTracksPath: resOutput,
            loopedTrackPaths: this.loopedTrackPaths,
            padTrackPaths: this.padTrackPaths,
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
