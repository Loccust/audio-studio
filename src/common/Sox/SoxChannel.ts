import IMixResponse from "../../contracts/sox/IMixResponse";
import { IChannel } from "../../contracts/entities/ITrack";
import SoxIntegration from "./SoxIntegration";
import audioConfig from "../audio.config";

export default class SoxChannel {
  static loopedChannelPaths: string[] = [];
  static padChannelPaths: string[] = [];
  static channels: IChannel[] = [];

  static async init(channels: IChannel[]) {
    this.channels = channels;
    return this;
  }

  private static async padChannel(channel: IChannel): Promise<IChannel> {
    return new Promise(async (resolve, reject) => {
      if (channel.repeat === 0) return resolve(channel);
      const filename = channel.path.split("/").pop()?.replace(".mp3", "");
      const output = `${audioConfig.baseAudioDir}/output/temp/channels/${filename}-pad.mp3`;
      SoxIntegration.pad(channel.path, channel.beginAt, output).then(
        (path) => {
          resolve({ ...channel, path });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  private static async loopChannel(channel: IChannel): Promise<IChannel> {
    return new Promise(async (resolve, reject) => {
      if (channel.repeat === 0) return resolve(channel);
      const filename = channel.path.split("/").pop()?.replace(".mp3", "");
      const output = `${audioConfig.baseAudioDir}/output/temp/${filename}-loop.mp3`;
      SoxIntegration.loop(channel.path, channel.repeat, output).then(
        (path) => {
          resolve({ ...channel, path });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  static async padMultiChannels() {
    if (this.channels.length > 1) {
      this.channels = await Promise.all(
        this.channels.map((channel: IChannel) => this.padChannel(channel))
      );
      this.padChannelPaths = this.channels
        .map((channel: IChannel) => channel.path)
        ?.filter((path) => path.includes("temp"));
    }
    return this;
  }

  static async loopMultiChannels() {
    this.channels = await Promise.all(
      this.channels.map((channel: IChannel) => this.loopChannel(channel))
    );
    this.loopedChannelPaths = this.channels
      .map((channel: IChannel) => channel.path)
      ?.filter((path) => path.includes("temp"));
    return this;
  }

  static async mixChannels() {
    return new Promise<IMixResponse>((resolve, reject) => {
      const output = `${audioConfig.baseAudioDir}/output/out.mp3`;
      const channelArgs = ["-t", "mp3", "-v"];
      const mixArgs = ["-t", "mp3"];

      let channelsPathArgs: Array<string | number> = [this.channels[0].path];
      this.channels.slice(1).forEach((channel) => {
        channelArgs.forEach((channelArg) => channelsPathArgs.push(channelArg));
        channelsPathArgs.push(channel.volume);
        channelsPathArgs.push(channel.path);
      });

      const args = [
        ...channelArgs,
        this.channels[0].volume,
        "-m",
        ...channelsPathArgs,
        ...mixArgs,
        output,
      ];

      SoxIntegration.mix(args, output).then(
        (resOutput) => {
          const mixRes: IMixResponse = {
            mixedChannelsPath: resOutput,
            loopedChannelPaths: this.loopedChannelPaths,
            padChannelPaths: this.padChannelPaths,
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
