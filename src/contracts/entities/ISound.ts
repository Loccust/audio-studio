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

export interface ITrack {
  id?: string,
  duration: number,
  description: string,
  loop: boolean,
  beginAt: number,
  volume: number,
  audioUri?: string,
  path: string
}
