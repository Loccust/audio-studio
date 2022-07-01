import SoundRepository from "../data/repositories/SoundRepository";
import ISoundService from "../contracts/services/ISoundService";
import { ISound, ITrack } from "../contracts/entities/ISound";
import { ISoundDto } from "./../contracts/dtos/ISoundDto";
import IMixResponse from "../contracts/sox/IMixResponse";
import audioConfig from "../common/audio.config";
import SoxTrack from "../common/Sox/SoxTrack";
import FileHelper from "../common/FileHelper";
import S3Provider from "../common/S3Provider";

export default class SoundService implements ISoundService {
  private readonly soundRepository: SoundRepository;

  constructor(soundRepository: SoundRepository) {
    this.soundRepository = soundRepository;
  }

  getSounds(): Promise<ISound[]> {
    return this.soundRepository.getList();
  }

  async createSound(soundDto: ISoundDto, files: Express.Multer.File[]) {
    try {
      //upload tracks on S3
      //  await Promise.all(
      //     files.map((file) =>
      //       S3Provider.uploadFile(file.buffer, `tracks/${file.originalname}`)
      //     )
      //   );

      //saveLocalFiles
      const fileLocalPromises = files.map((file) =>
        FileHelper.saveLocalFile(
          file.buffer,
          `${audioConfig.baseAudioDir}/output/temp/${file.originalname}`
        )
      );
      const localTrackFiles = await Promise.all(fileLocalPromises);

      //map dto to entity/include local files
      const tracks: ITrack[] = soundDto.tracks.map((trackDto) => ({
        ...trackDto,
        path: localTrackFiles.find((file) =>
          file.includes(trackDto.fileName)
        ) as string,
      }));

      //mix tracks
      const mixResponse: IMixResponse = await SoxTrack.init(
        soundDto.duration,
        soundDto.title,
        tracks
      )
        .then(() => SoxTrack.loopMultiTracks())
        .then(() => SoxTrack.padMultiTracks())
        .then(() => SoxTrack.mixTracks());

      //delete temp files
      FileHelper.cleanDirectory(`${audioConfig.baseAudioDir}/output/temp`);

      //upload sound on S3
      const soundBuffer = FileHelper.getBufferFile(
        mixResponse.mixedTracksPath
      ) as Buffer;
      await S3Provider.uploadFile(soundBuffer, `sounds/${soundDto.title}`);

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
      return sound;
      // return await this.soundRepository.save(sound);
      //map to dto
    } catch (err) {
      throw new Error(`error to create sound: ${err}`);
    }
  }
}
