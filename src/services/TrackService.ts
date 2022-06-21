import { IChannel } from "../contracts/entities/ITrack";
import IMixResponse from "../contracts/sox/IMixResponse";
import SoxChannel from "../common/Sox/SoxChannel";
import FileHelper from "../common/FileHelper";

export default class TrackService {
  async mixChannels(channels: IChannel[]) {
    try {
      const mixResponse: IMixResponse = 
        await SoxChannel.init(channels)
          .then(() => SoxChannel.loopMultiChannels())
          .then(() => SoxChannel.padMultiChannels())
          .then(() => SoxChannel.mixChannels());

      //save pad tracks
      await Promise.allSettled(
        [
          ...new Set([
            ...mixResponse.loopedChannelPaths,
            ...mixResponse.padChannelPaths,
          ]),
        ].map((channelPath) => FileHelper.deleteFile(channelPath))
      );

    } catch (error) {
      console.error(`Error to save track! ${error}`);
      return false;
    }
  }
}