import { ITrack } from "./ITrack";

export interface ISound {
    id?: string;
    title: string;
    tracks: ITrack[];
    duration: number,
    imageUri: string,
    audioUri: string,
    likes: number,
    creationDate: Date,
    lastAltDate: Date,
    userId: number,
}