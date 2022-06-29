export interface ITrackDto {
  id?: string;
  description: string;
  loop: boolean;
  beginAt: number;
  volume: number;
  duration: number;
  fileName: string;
}