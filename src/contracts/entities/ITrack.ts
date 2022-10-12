export interface ITrack {
  id?: string;
  duration: number;
  description: string;
  loop: boolean;
  beginAt: number;
  volume: number;
  audioUri?: string;
  path: string;
//   fileName: string;
}