import childProcess from "child_process";
import { once } from "events";

export default class AudioService {
  #executeSoxCommand(args) {
    return childProcess.spawn("sox", args);
  }

  async getAudioBitRate(song) {
    try {
      const args = ["--i", "-B", song];
      const { stderr, stdout } = this.#executeSoxCommand(args);
      await Promise.all([once(stderr, "readable"), once(stdout, "readable")]);
      const [success, error] = [stdout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);
      return success.toString().trim().replace(/k/, "000");
    } catch (error) {
      console.error(`deu ruim no bitrate: ${error}`);
      return fallbackBitRate;
    }
  };

  
 async mixAudios(song1, song2) {
    try {
      const args = [
        "-t",
        "mp3",
        "-v",
        "0.99",
        "-m",
        song1,
        "-t",
        "mp3",
        "-v",
        "0.99",
        song2,
        "-t",
        "mp3",
        "out.mp3",
      ];
  
      this.#executeSoxCommand(args);
    } catch (error) {
      console.error(`deu ruim no mix: ${error}`);
      return await Promise.reject(error);
    }
  };

  async lopAudio (song, times) {
    try {
      const args = [song, "looped.mp3", "repeat", times];
       this.#executeSoxCommand(args);
    } catch (error) {
      console.error(`deu ruim no loop: ${error}`);
      return await Promise.reject(error);
    }
  };
}


