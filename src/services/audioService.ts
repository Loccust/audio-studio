import childProcess from "child_process";
import { once } from "events";
import * as fs from "fs";

export default class AudioService {
  private baseAudioDir = "src/audio";

  private executeSoxCommand(args: any[]) {
    return childProcess.spawn("sox", args);
  }

  private executeSoxSyncCommand(args: any[]) {
    return childProcess.spawnSync("sox", args);
  }

  private deleteFile(filepath: string) {
    try {
      fs.unlinkSync(filepath);
      //file removed
    } catch (err) {
      console.error(err);
    }
  }

  public getAudioBitRate = async (song: string): Promise<string> => {
    try {
      const args = ["--i", "-B", song];
      const { stderr, stdout } = this.executeSoxCommand(args);

      await Promise.all([once(stderr, "readable"), once(stdout, "readable")]);
      const [success, error] = [stdout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);
      return success.toString();
    } catch (error) {
      console.error(`deu ruim no bitrate: ${error}`);
      return "0";
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
      console.error(`deu ruim no bitrate: ${error}`);
      return "0";
    }
  }

  private async padTracks(trackPath: string, beginAt: number) {
    return new Promise<string>((resolve, reject) => {
      const filename = trackPath.split("/").pop();
      const output = `${this.baseAudioDir}/output/${filename}-pad.mp3`;
      const trackArgs = ["-t", "mp3", "-v", "0.99"];
      const outArgs = ["-t", "mp3"];

      const silenceBefore = beginAt;
      const args = [trackPath, output, "pad", "10@0"];

      const child = this.executeSoxCommand(args);
      console.log("close", args);
      child.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        if (code === 0) resolve(output);
        else reject(`Error to pad ${trackPath}`);
      });
    });
  }

  async mixAudios(trackPaths: string[]) {
    try {
      const trackArgs = ["-t", "mp3", "-v", "0.99"];
      const output = `${this.baseAudioDir}/output/out.mp3`;
      const mixArgs = ["-t", "mp3"];

      //[ ] dto class/interface to pass all arguments

      //[ ] function to get/convert the bitrate of the songs - save/delete
      //[ ] function to loop the tracks/ if have - save/delete
      //[x] function to run pad (the shorter track to the length of the longer) - save/delete
      //[ ] function to get the filename of the mixed track
      //[x] mix the tracks - save

      let padTrackPaths = trackPaths;
      if (trackPaths.length > 1) {
        const padTrackPromises: Promise<string>[] = trackPaths
          .slice(1)
          .map((trackPath: string, i) => this.padTracks(trackPath, i * 5));
        padTrackPaths = await Promise.all(padTrackPromises);
      }

      let tracksPathArgs: string[] = [];
      trackPaths.forEach((trackPath, i) => {
        if (i > 0) {
          //and if song dont begin at 0
          trackArgs.forEach((trackArg) => {
            tracksPathArgs.push(trackArg);
          });
          tracksPathArgs.push(padTrackPaths[i - 1]);
        } else {
          tracksPathArgs.push(trackPath);
        }
      });

      const args = [...trackArgs, "-m", ...tracksPathArgs, ...mixArgs, output];

      const child = this.executeSoxCommand(args);
      child.on("close", (code) => {
        if (code === 0) {
          padTrackPaths.forEach((padTrackPath) =>
            this.deleteFile(padTrackPath)
          );
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

  async loopAudio(song: string, times: number) {
    try {
      const output = "src/audio/output/looped.mp3";
      const args = [song, output, "repeat", times];
      this.executeSoxCommand(args);
    } catch (error) {
      console.error(`deu ruim no loop: ${error}`);
      return await Promise.reject(error);
    }
  }
}
