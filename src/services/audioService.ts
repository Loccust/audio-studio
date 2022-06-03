import childProcess from "child_process";
import { once } from "events";

export default class AudioService {
  private executeSoxCommand(args: any[]) {
    return childProcess.spawn("sox", args);
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

  async mixAudios(songsPath: string[]) {
    try {
      const songsArgs = ["-t", "mp3", "-v", "0.99"];
      const songs = songsPath.map((song) => [song, ...songsArgs]);
      const output = "src/audio/output/out.mp3";
      const mixArgs = ["-t", "mp3"];

      const args = [...songsArgs, "-m", songs, ...mixArgs, output];
      const { stderr, stdout } = this.executeSoxCommand(args);
      
      const [success, error] = [stdout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);
      return success.toString();

    } catch (error) {
      console.error(`deu ruim no mix: ${error}`);
      return false;
    }
  }

  async loopAudio(song: string, times: number) {
    try {
      const args = [song, "looped.mp3", "repeat", times];
      this.executeSoxCommand(args);
    } catch (error) {
      console.error(`deu ruim no loop: ${error}`);
      return await Promise.reject(error);
    }
  }
}
