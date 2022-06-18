import { IChannel } from "../contracts/entities/ITrack";
import FileHelper from "../common/FileHelper";
import SoxChannel from "../common/Sox/SoxChannel";
import IMixResponse from "../contracts/sox/IMixResponse";

export default class ChannelService {
  async mixChannels(channels: IChannel[]) {
    try {
      const mixResponse: IMixResponse = 
        await SoxChannel.init(channels)
          .then(() => SoxChannel.loopMultiChannels())
          .then(() => SoxChannel.padMultiChannels())
          .then(() => SoxChannel.mixChannels());

      await Promise.allSettled(
        [
          ...new Set([
            ...mixResponse.loopedChannelPaths,
            ...mixResponse.loopedChannelPaths,
          ]),
        ].map((channelPath) => FileHelper.deleteFile(channelPath))
      );

    } catch (error) {
      console.error(`Error to save track! ${error}`);
      return false;
    }
  }
}
