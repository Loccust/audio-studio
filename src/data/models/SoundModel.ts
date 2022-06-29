import { ISound } from './../../contracts/entities/ISound';
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const soundSchema = new Schema<ISound>({
  title: String,
  likes: Number,
  userId: Number,
  duration: Number,
  imageUri: String,
  audioUri: String,
  lastAltDate: Date,
  creationDate: Date,
  tracks: [
    {
      description: String,
      loop: Boolean,
      beginAt: Number,
      volume: Number,
      audioUri: String,
    },
  ],
});

const SoundModel = model("Sound", soundSchema);
export default SoundModel;