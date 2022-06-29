import SoundRepository from "../data/repositories/SoundRepository";
import { ISoundDto } from "./../contracts/dtos/ISoundDto";
import IMixResponse from "../contracts/sox/IMixResponse";
import { ITrack } from "../contracts/entities/ISound";
import audioConfig from "../common/audio.config";
import SoxTrack from "../common/Sox/SoxTrack";
import FileHelper from "../common/FileHelper";
import path from "path";

export default class SoundService {
  private readonly soundRepository: SoundRepository;

  constructor(soundRepository: SoundRepository) {
    this.soundRepository = soundRepository;
  }

  async saveLocalFiles(files: Express.Multer.File[]) {
    const fileLocalPromises = files.map((file) => {
      return FileHelper.saveLocalFile(
        file.buffer,
        `${audioConfig.baseAudioDir}/output/temp/tracks/${file.originalname}`
      );
    });
    return await Promise.all(fileLocalPromises);
  }

  async createSound(soundDto: ISoundDto, files: Express.Multer.File[]) {
    try {
      const localTrackFiles = await this.saveLocalFiles(files);
      const mytracks: ITrack[] = soundDto.tracks.map((trackDto) => {
        const fileTrack = localTrackFiles.find((file) =>
          file.includes(trackDto.fileName)
        );
        if (!fileTrack)
          throw new Error(
            `track filename(${trackDto.fileName}) not found in provided files`
          );
        return {
          ...trackDto,
          path: fileTrack,
        };
      });
      
      const song = `${audioConfig.baseAudioDir}/songs/conversation.mp3`;
      const fart = `${audioConfig.baseAudioDir}/fx/fart-128kbps.mp3`;
      const boo = `${audioConfig.baseAudioDir}/fx/boo-128kbps.mp3`;

      //UPLOAD tracks on S3
      const tracks: ITrack[] = [
        {
          path: song,
          beginAt: 0,
          loop: false,
          volume: 0.99,
          description: "",
          audioUri: "",
          duration: 120,
        },
        {
          path: fart,
          beginAt: 10,
          loop: true,
          volume: 0.5,
          description: "",
          audioUri: "",
          duration: 5,
        },
        {
          path: boo,
          beginAt: 20,
          loop: false,
          volume: 0.1,
          description: "",
          audioUri: "",
          duration: 2,
        },
      ];

      const mix = await this.mixTracks(mytracks);
      return mix;
      // if (!mix) return;
      // //UPLOAD mix on S3
      // const sound: ISound = {
      //   //map to entity
      //   ...soundDto,
      //   tracks: soundDto.tracks.map(
      //     (track): ITrack => ({
      //       ...track,
      //       path: "",
      //     })
      //   ),
      //   imageUri: soundDto.imageUri || "",
      //   audioUri: mix.mixedTracksPath,
      //   creationDate: new Date(),
      //   lastAltDate: new Date(),
      //   duration: 0,
      //   userId: 0,
      //   likes: 0,
      // };
      // const soundRes = this.soundRepository.save(sound);
      // return soundRes;
    } catch (err) {}
  }

  async mixTracks(tracks: ITrack[]) {
    try {
      const mixResponse: IMixResponse = await SoxTrack.init(tracks)
        .then(() => SoxTrack.loopMultiTracks())
        .then(() => SoxTrack.padMultiTracks())
        .then(() => SoxTrack.mixTracks());

      //save pad tracks
      await Promise.allSettled(
        [
          ...new Set([
            ...mixResponse.loopedTrackPaths,
            ...mixResponse.padTrackPaths,
          ]),
        ].map((trackPath) => FileHelper.deleteFile(trackPath))
      );
      return mixResponse;
    } catch (error) {
      console.error(`Error to save track! ${error}`);
    }
  }
}
