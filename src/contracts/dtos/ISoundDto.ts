import { ITrackDto } from "./ITrackDto";

export interface ISoundDto {
  id?: string;
  title: string;
  duration: number;
  imageUri?: string;
  tracks: ITrackDto[];
}