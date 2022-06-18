import childProcess from "child_process";
import { once } from "events";

export default class SoxIntegration {
  private static executeSoxCommand(args: any[]) {
    return childProcess.spawn("sox", args);
  }

  static getBitRate = async (path: string): Promise<Number> => {
    try {
      const args = ["--i", "-B", path];
      const { stderr, stdout } = this.executeSoxCommand(args);

      await Promise.all([once(stderr, "readable"), once(stdout, "readable")]);
      const [success, error] = [stdout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);
      const bitRate = success.toString().replace("\n", "").replace("k", "000");
      return Number(bitRate);
    } catch (error) {
      console.error(`Unable to get sox bitrate: ${error}`);
      return 0;
    }
  };

  static async getDuration(path: string) {
    try {
      const args = ["--i", "-D", path];
      const { stderr, stdout } = this.executeSoxCommand(args);

      await Promise.all([once(stderr, "readable"), once(stdout, "readable")]);
      const [success, error] = [stdout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);
      return success.toString();
    } catch (error) {
      console.error(`Unable to get sox duration: ${error}`);
      return "0";
    }
  }

  static async pad(path: string, beginAt: number, output: string) {
    return new Promise<string>((resolve, reject) => {
      const filename = path.split("/").pop()?.replace(".mp3", "");
      const args = [path, output, "pad", beginAt];
      const child = this.executeSoxCommand(args);

      child.on("close", (code) => {
        if (code === 0) resolve(output);
        else {
          reject(`Unable to pad: ${filename}`);
          console.error(`pad process exited with code ${code}`);
        }
      });
    });
  }

  static async loop(path: string, repeat: number, output: string) {
    return new Promise<string>((resolve, reject) => {
      const filename = path.split("/").pop()?.replace(".mp3", "");
      const args = [path, output, "repeat", repeat];
      const child = this.executeSoxCommand(args);

      child.on("close", (code) => {
        if (code === 0) resolve(output);
        else {
          reject(`Unable to exec sox loop: ${filename}`);
          console.error(`loop process exited with code ${code}`);
        }
      });
    });
  }

  static async mix(args: Array<string | number>, output: string) {
    return new Promise<string>((resolve, reject) => {
      const child = this.executeSoxCommand(args);
      child.on("close", async (code) => {
        if (code === 0) {
          resolve(output);
        } else reject(`Unable to exec sox mix: ${code}`);
      });
    });
  }
}
