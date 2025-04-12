import express from 'express';
import { updateProgress, getProgress } from '../controllers/videoController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).send('No token');
  try {
    req.user = jwt.verify(token, 'secret');
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
};

router.post('/progress', authMiddleware, updateProgress);
router.get('/progress/:videoId', authMiddleware, getProgress);
export default router;
