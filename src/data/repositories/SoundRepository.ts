import ISoundRepository from "../../contracts/repositories/ISoundRepository";
import { ISound } from "../../contracts/entities/ISound";
import SoundModel from "../models/SoundModel";

export default class SoundRepository implements ISoundRepository {
  async save(sound: ISound): Promise<ISound> {
    const soundCreated = await SoundModel.create({...sound});
    return soundCreated.$model<ISound>("Sound");
  }
  async getList(): Promise<ISound[]> {
    return await SoundModel.find();
  }
}
