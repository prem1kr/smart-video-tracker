# 🎥 Smart Video Tracker

A full-stack web application that tracks user progress while watching videos, prevents skipping, and resumes from the last watched position. It also includes user authentication.

- Setup instructions
- Tech stack
- How it works
- Design decisions


---

## 🚀 Features

- 🔐 Login / Signup functionality
- 📼 Watch videos with real-time progress tracking
- 🧠 Automatically resumes from last watched timestamp
- ⏱️ Prevents skipped segments from being marked as watched
- 🗂️ MongoDB stores user data and watched intervals

---

## 🛠️ Tech Stack

### Frontend:
- React.js (Functional Components)
- Material ui for styling
- Axios for API calls

### Backend:
- Node.js + Express.js
- MongoDB + Mongoose
- JSON Web Tokens (JWT) for authentication

---

## 📁 Project Structure

```
├── backend
│   ├── controllers
│   ├── db
│   ├── models
│   ├── routes
│   ├── server.js
│   └── .env
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   └── VideoPlayer.css
│   │   ├── App.js
│   │   └── index.js
│   ├── video.mp4
│   └── build (only in production)
```

---

## 🔧 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/prem1kr/smart-video-tracker.git
cd smart-video-tracker
```

---

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start backend:
```bash
npm start
```

---

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

Start frontend:
```bash
npm start
```

App runs at [http://localhost:3000](http://localhost:3000)

---

## ⚙️ How It Works

### Backend:
- `authController.js`: Handles login/signup with JWT tokens.
- `videoController.js`: Saves watched time intervals to MongoDB.
- `Progress.js`: Stores video watch intervals per user.
- `server.js`: Main Express server that connects routes and DB.

### Frontend:
- `Login.jsx` & `Signup.jsx`: Auth pages.
- `VideoPlayer.jsx`: 
  - Tracks which parts of the video were watched.
  - Sends updates to backend every few seconds.
  - Resumes playback from the last watched interval.
- `video.mp4`: Local video used for testing (can be replaced).

---

## 📦 Deployment

If deploying to a platform like Vercel or Netlify for frontend and Render for backend:

1. **Frontend**: Run `npm run build` inside `frontend` and push the contents of `./build`.
2. **Backend**: Deploy using services like Render or Railway, and set environment variables.

---

## 📌 Design Decisions

- **Custom Video Progress Tracking**: Instead of using browser's default progress, we track "watched intervals" and ignore skipped parts.
- **Resumable Playback**: When a user returns, the last saved interval is fetched and played.
- **Separate Backend/Frontend**: Easier deployment and scalability.
- **JWT Authentication**: Secure and stateless token-based login system.

---

## ✨ Future Improvements

- Add multiple video support.
- Include user dashboard to show progress analytics.
- Add roles (admin, viewer) for content management.

---

## 👨‍💻 Author

**Prem Kumar**  
📍 Mohali, India  
🔗 [GitHub](https://github.com/prem1kr) | [LinkedIn](https://www.linkedin.com/in/prem-kumar-3b38b1290)

---
## Explanation ;- 

Perfect — here’s a detailed explanation covering:

- **How watched intervals are tracked**
- **How intervals are merged to calculate unique progress**
- **Challenges faced and how they were solved**
---

## 🎯 How Watched Intervals Are Tracked

In the **VideoPlayer.jsx**, we use the `onTimeUpdate` event to frequently track the video’s `currentTime` and whether the user is actually watching or skipping.

### Basic Flow:
```jsx
videoRef.current.currentTime; // gives current playback time
```

We:
- Poll the video every second
- Store `startTime` when video is playing
- Store `endTime` when the user pauses, seeks, or ends the video
- Save that interval as `{ start: Number, end: Number }`

Then we send that data to the backend using Axios like:

```js
POST /api/video/progress
{
  intervals: [
    { start: 10, end: 20 },
    { start: 22, end: 30 },
    ...
  ]
}
```

> 🔐 Intervals are stored *per user*, so users can resume individually.

---

## 🧠 How Watched Intervals Are Merged

We don’t just add time differences directly — that would double-count overlapping or repeated segments.

Instead, we **merge overlapping intervals** to calculate **unique progress**.

### Example:
```js
Input Intervals:
[{ start: 0, end: 10 }, { start: 8, end: 15 }, { start: 16, end: 20 }]

Merged Intervals:
[{ start: 0, end: 15 }, { start: 16, end: 20 }]
```

### Backend Logic (Simplified in videoController.js):
```js
function mergeIntervals(intervals) {
  if (!intervals.length) return [];

  intervals.sort((a, b) => a.start - b.start);

  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const current = intervals[i];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  return merged;
}
```

Then to calculate percentage watched:
```js
const totalWatched = merged.reduce((sum, i) => sum + (i.end - i.start), 0);
const percentWatched = (totalWatched / videoDuration) * 100;
```

---

## ⚠️ Challenges Faced & Solutions

### 1. **Users Skipping Videos**
**Problem**: Users could just drag the video to the end to get full progress.

**Solution**:
- I ignored intervals less than 2 seconds (to prevent fast skips).
- Only saved intervals if the user watched at least N seconds.
- Tracked *actual time watched* rather than current video position.

---

### 2. **Overlapping Intervals**
**Problem**: Watching the same segment multiple times inflated the progress.

**Solution**: 
- I merged overlapping intervals on the backend before calculating total time watched.
- Ensured no segment is counted twice.

---

### 3. **Syncing with MongoDB**
**Problem**: Frequent requests on every second caused DB performance issues.

**Solution**:
- Debounced updates: Sent to backend every few seconds instead of constantly.
- Only sent new intervals when the user paused, exited, or hit certain milestones.

---

### 4. **Video Resumption**
**Problem**: User closed browser and came back later; video started from beginning.

**Solution**:
- On login, I fetched the user’s last saved intervals.
- On video mount, I set `videoRef.current.currentTime` to the last saved `end`.

---

## screenshoots :- 

![alt text](<screenshot/WhatsApp Image 2025-04-13 at 06.07.41_d2f87499.jpg>)
![alt text](<screenshot/WhatsApp Image 2025-04-13 at 06.08.04_1ba3cf43.jpg>)
![alt text](<screenshot/WhatsApp Image 2025-04-13 at 06.09.06_00c81563.jpg>)