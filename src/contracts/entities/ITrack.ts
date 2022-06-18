export interface ITrack {
    id: string;
    title: string;
    tracks: IChannel[];
}

export interface IChannel {
  path: string;
  beginAt: number;
  repeat: number;
  volume: number;
}
