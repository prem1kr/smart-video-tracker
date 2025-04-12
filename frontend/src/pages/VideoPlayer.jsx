import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './VideoPlayer.css';
import video from '../video.mp4';

import { Box, Typography, Card, CardContent, LinearProgress } from '@mui/material';

const VideoPlayer = ({ token }) => {
  const videoRef = useRef(null);
  const [watchedIntervals, setWatchedIntervals] = useState([]);
  const [start, setStart] = useState(null);
  const [progress, setProgress] = useState(0);
  const [maxWatchTime, setMaxWatchTime] = useState(0);

  const videoId = 'video1';

  const mergeIntervals = (intervals) => {
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (let interval of intervals) {
      const last = merged[merged.length - 1];
      if (!last || last[1] < interval[0]) merged.push(interval);
      else last[1] = Math.max(last[1], interval[1]);
    }
    return merged;
  };

  const saveProgress = async (interval) => {
    const duration = videoRef.current.duration;
    const currentTime = videoRef.current.currentTime;
    const res = await axios.post(
      'https://smart-video-tracker.onrender.com/api/video/progress',
      {
        videoId,
        newInterval: interval,
        currentTime,
        duration,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setProgress(res.data.percentage ?? 0);
  };

  useEffect(() => {
    const fetchProgress = async () => {
      const duration = videoRef.current.duration;
      const res = await axios.get(
        `https://smart-video-tracker.onrender.com/api/video/progress/${videoId}?duration=${duration}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProgress(res.data.percentage ?? 0);
      videoRef.current.currentTime = res.data.lastPosition ?? 0;
      setMaxWatchTime(res.data.lastPosition ?? 0);
    };

    videoRef.current?.addEventListener('loadedmetadata', fetchProgress);
  }, [token]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const currentTime = video.currentTime;

    if (currentTime > maxWatchTime + 1) {
      video.currentTime = maxWatchTime;
      return;
    }

    if (currentTime > maxWatchTime) {
      setMaxWatchTime(currentTime);
    }

    if (start === null) {
      setStart(currentTime);
    }
  };

  const handlePause = () => {
    if (start !== null) {
      const end = videoRef.current.currentTime;
      if (end - start >= 1) {
        const newIntervals = [...watchedIntervals, [start, end]];
        const merged = mergeIntervals(newIntervals);
        setWatchedIntervals(merged);
        saveProgress([start, end]);
      }
      setStart(null);
    }
  };

  return (
    <Box className="video-container" display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Box className="video-wrapper" width="100%" maxWidth="800px">
        <video
          ref={videoRef}
          controls
          onTimeUpdate={handleTimeUpdate}
          onPause={handlePause}
          className="responsive-video"
          style={{ width: '100%', borderRadius: '8px' }}
        >
          <source src= {video} type="video/mp4" />
        </video>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 800, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="body1" gutterBottom>
            Progress: {progress}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default VideoPlayer;
