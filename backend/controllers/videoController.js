import { Progress } from '../models/Progress.js';

const mergeIntervals = (intervals) => {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
};

export const updateProgress = async (req, res) => {
  const { videoId, newInterval, currentTime, duration } = req.body;
  const userId = req.user.userId;

  let progress = await Progress.findOne({ userId, videoId });
  if (!progress) {
    progress = new Progress({ userId, videoId, watchedIntervals: [], lastPosition: 0 });
  }
  progress.watchedIntervals.push(newInterval);
  progress.watchedIntervals = mergeIntervals(progress.watchedIntervals);
  progress.lastPosition = currentTime;
  await progress.save();

  const totalWatched = progress.watchedIntervals.reduce((acc, [start, end]) => acc + (end - start), 0);
  const percentage = ((totalWatched / duration) * 100).toFixed(2);

  res.json({ percentage });
};

export const getProgress = async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.userId;
  const progress = await Progress.findOne({ userId, videoId });
  if (!progress) return res.json({ lastPosition: 0, percentage: 0 });

  const totalWatched = progress.watchedIntervals.reduce((acc, [start, end]) => acc + (end - start), 0);
  const percentage = ((totalWatched / req.query.duration) * 100).toFixed(2);

  res.json({ lastPosition: progress.lastPosition, percentage });
};
