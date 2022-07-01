import { ISound } from './../entities/ISound';

export default interface ISoundRepository {
    save(sound: ISound): Promise<ISound>;
    getList(): Promise<ISound[]>;
} 