import SoundRepository from "../data/repositories/SoundRepository";
import ISoundService from "../contracts/services/ISoundService";
import { ISound, ITrack } from "../contracts/entities/ISound";
import { ISoundDto } from "./../contracts/dtos/ISoundDto";
import IMixResponse from "../contracts/sox/IMixResponse";
import audioConfig from "../common/audio.config";
import SoxTrack from "../common/Sox/SoxTrack";
import FileHelper from "../common/FileHelper";

export default class SoundService implements ISoundService {
  private readonly soundRepository: SoundRepository;

  constructor(soundRepository: SoundRepository) {
    this.soundRepository = soundRepository;
  }

  async createSound(soundDto: ISoundDto, files: Express.Multer.File[]) {
    try {
      //saveLocalFiles
      const fileLocalPromises = files.map((file) => {
        return FileHelper.saveLocalFile(
          file.buffer,
          `${audioConfig.baseAudioDir}/output/temp/tracks/${file.originalname}`
        );
      });
      const localTrackFiles = await Promise.all(fileLocalPromises);

      //map dto to entity/include local files
      const tracks: ITrack[] = soundDto.tracks.map((trackDto) => {
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

      //UPLOAD tracks on S3
      //...

      //mix tracks
      const mixResponse: IMixResponse = await SoxTrack.init(tracks)
        .then(() => SoxTrack.loopMultiTracks())
        .then(() => SoxTrack.padMultiTracks())
        .then(() => SoxTrack.mixTracks());

      //delete temp files
      await Promise.allSettled(
        [
          ...new Set([
            ...mixResponse.loopedTrackPaths,
            ...mixResponse.padTrackPaths,
          ]),
        ].map((trackPath) => FileHelper.deleteFile(trackPath))
      );

      //UPLOAD sound on S3
      //...

      //map to entity
      const sound: ISound = {
        ...soundDto,
        tracks,
        imageUri: soundDto.imageUri || "",
        audioUri: mixResponse.mixedTracksPath,
        creationDate: new Date(),
        lastAltDate: new Date(),
        duration: 0,
        userId: 0,
        likes: 0,
      };
      const soundRes = await this.soundRepository.save(sound);
      //map to dto
      return soundRes;
    } catch (err) {
      throw new Error(`error to create sound: ${err}`);
    }
  }
}