import childProcess from "child_process";
import { once } from "events";
import * as fs from "fs";
import ITrack from "../common/dto/ITrack";

export default class AudioService {
  private baseAudioDir = "audio";

  private executeSoxCommand(args: any[]) {
    return childProcess.spawn("sox", args);
  }

  private deleteFile(filepath: string) {
    try {
      fs.unlinkSync(filepath);
    } catch (err) {
      console.error(`erro ao deletar arquivo: ${err}`);
    }
  }

  public getAudioBitRate = async (song: string): Promise<Number> => {
    try {
      const args = ["--i", "-B", song];
      const { stderr, stdout } = this.executeSoxCommand(args);

      await Promise.all([once(stderr, "readable"), once(stdout, "readable")]);
      const [success, error] = [stdout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);
      const bitRate = success.toString().replace("\n", "").replace("k", "000");
      return Number(bitRate);
    } catch (error) {
      console.error(`erro ao obter bitrate: ${error}`);
      return 0;
    }
  };

  private async getAudioDuration(trackPath: string) {
    try {
      const args = ["--i", "-D", trackPath];
      const { stderr, stdout } = this.executeSoxCommand(args);

      await Promise.all([once(stderr, "readable"), once(stdout, "readable")]);
      const [success, error] = [stdout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);
      return success.toString();
    } catch (error) {
      console.error(`erro ao obter duracao: ${error}`);
      return "0";
    }
  }

  private async soxPadTrack(track: ITrack) {
    return new Promise<ITrack>((resolve, reject) => {
      if (track.beginAt === 0) return resolve(track);

      const filename = track.path.split("/").pop()?.replace(".mp3", "");
      const output = `${this.baseAudioDir}/output/temp/${filename}-pad.mp3`;

      const args = [track.path, output, "pad", track.beginAt];
      const child = this.executeSoxCommand(args);

      child.on("close", (code) => {
        if (code === 0) resolve({ ...track, path: output });
        else {
          reject(`Error to pad: ${filename}`);
          console.error(`pad process exited with code ${code}`);
        }
      });
    });
  }

  async soxLoopTrack(track: ITrack) {
    return new Promise<ITrack>((resolve, reject) => {
      if (track.repeat === 0) return resolve(track);
      const filename = track.path.split("/").pop()?.replace(".mp3", "");
      const output = `${this.baseAudioDir}/output/temp/${filename}-loop.mp3`;

      const args = [track.path, output, "repeat", track.repeat];
      const child = this.executeSoxCommand(args);

      child.on("close", (code) => {
        if (code === 0) resolve({ ...track, path: output });
        else {
          reject(`Error to loop: ${filename}`);
          console.error(`loop process exited with code ${code}`);
        }
      });
    });
  }

  async mixAudios(tracks: ITrack[]) {
    try {
      //[x] dto class/interface to pass all arguments
      //[x] function to loop the tracks/ if have - save/delete
      //[x] function to run pad (the shorter track to the length of the longer) - save/delete
      //[x] mix the tracks - save

      //[ ] receive files from aws s3
      //[ ] save files to local disk
      //[ ] validate dtos

      //[ ] validate bitrate
      //[ ] validate duration
      //[ ] error handling/logging - return messages

      //loop tracks to mix
      let _tracks = [...tracks];
      const loopTrackPromises = _tracks.map((track: ITrack) =>
        this.soxLoopTrack(track)
      );
      _tracks = await Promise.all(loopTrackPromises);
      const loopedTrackPaths = _tracks
        .map((track: ITrack) => track.path)
        ?.filter((path) => path.includes("temp"));

      //pad tracks to mix
      let padTrackPaths: string[] = [];
      if (tracks.length > 1) {
        const padTrackPromises = _tracks.map((track: ITrack) =>
          this.soxPadTrack(track)
        );
        _tracks = await Promise.all(padTrackPromises);
        padTrackPaths = _tracks
          .map((track: ITrack) => track.path)
          ?.filter((path) => path.includes("temp"));
      }

      //mix the tracks
      const trackArgs = ["-t", "mp3", "-v"];
      const output = `${this.baseAudioDir}/output/out.mp3`;
      const mixArgs = ["-t", "mp3"];

      let tracksPathArgs: Array<string | number> = [_tracks[0].path];
      _tracks.slice(1).forEach((track) => {
        trackArgs.forEach((trackArg) => {
          tracksPathArgs.push(trackArg);
        });
        tracksPathArgs.push(track.volume);
        tracksPathArgs.push(track.path);
      });

      const args = [
        ...trackArgs,
        _tracks[0].volume,
        "-m",
        ...tracksPathArgs,
        ...mixArgs,
        output,
      ];
      const child = this.executeSoxCommand(args);

      child.on("close", async (code) => {
        // //delete the temp track files
        let tempTrackPaths = [...loopedTrackPaths, ...padTrackPaths];
        //remove duplicates
        tempTrackPaths.filter((path, i) => tempTrackPaths.indexOf(path) === i);
        const deleteTrackPromises = tempTrackPaths.map((trackPath) =>
          this.deleteFile(trackPath)
        );
        await Promise.allSettled(deleteTrackPromises);
        console.log(`mix process exited with code ${code}`);
        if (code === 0) {
          //return success
        } else {
          //return error
        }
      });
    } catch (error) {
      console.error(`deu ruim no mix: ${error}`);
      return false;
    }
  }
}
