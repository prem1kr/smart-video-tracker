import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  videoId: String,
  watchedIntervals: [[Number]],
  lastPosition: Number,
});

export const Progress = mongoose.model('Progress', progressSchema);