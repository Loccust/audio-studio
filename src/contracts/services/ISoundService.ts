import { ISoundDto } from "../dtos/ISoundDto";
import { ISound } from "../entities/ISound";

export default interface ISoundService {
  createSound(soundDto: ISoundDto, files: Express.Multer.File[]): Promise<ISound>;
  getSounds(): Promise<ISound[]>;
}
