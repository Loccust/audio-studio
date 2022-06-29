import { ISound } from "../../contracts/entities/ISound";
import IBaseRepo from "../../contracts/repositories/IBaseRepository";
import SoundModel from "../models/SoundModel";

export default class SoundRepository implements IBaseRepo<ISound> {
  async save(sound: ISound): Promise<ISound> {
    const soundCreated = await SoundModel.create({...sound});
    const soundRes = soundCreated.$model<ISound>("Sound");
    return soundRes;
  }
}
