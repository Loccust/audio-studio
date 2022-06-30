import ISoundRepository from "../../contracts/repositories/ISoundRepository";
import { ISound } from "../../contracts/entities/ISound";
import SoundModel from "../models/SoundModel";

export default class SoundRepository implements ISoundRepository {
  async save(sound: ISound): Promise<ISound> {
    const soundCreated = await SoundModel.create({...sound});
    const soundRes = soundCreated.$model<ISound>("Sound");
    return soundRes;
  }
}
