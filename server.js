const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// In-memory session storage (in production, use a database)
const sessionLogs = [];

// Enhanced feedback system with varied responses
const FEEDBACK_MESSAGES = {
  outline: [
    "Great job starting the face outline!",
    "Perfect! You're drawing the face shape beautifully!",
    "Excellent! The face outline is looking great!"
  ],
  hair: [
    "Wow! You're adding beautiful hair!",
    "Fantastic! The hair is looking so nice!",
    "Amazing! You're creating wonderful hair!"
  ],
  eye_left: [
    "Great! You're drawing the left eye!",
    "Perfect! The left eye is looking good!",
    "Excellent! You're adding the left eye!"
  ],
  eye_right: [
    "Wonderful! Now the right eye!",
    "Fantastic! Both eyes are looking great!",
    "Amazing! You're giving the face eyes to see!"
  ],
  nose: [
    "Perfect! You're adding a cute nose!",
    "Great! The nose is looking wonderful!",
    "Excellent! You're creating a nice nose!"
  ],
  smile: [
    "Beautiful! You're adding a happy smile!",
    "Wonderful! The face is looking so happy!",
    "Perfect! You've created a lovely smile!"
  ],
  completion: [
    "Congratulations! You've completed the whole face!",
    "Amazing work! The face looks perfect!",
    "Fantastic job! You've drawn a beautiful face!"
  ]
};

app.get('/api/feedback', (req, res) => {
  const { feature, progress, total } = req.query;
  
  let messages;
  if (feature && FEEDBACK_MESSAGES[feature]) {
    messages = FEEDBACK_MESSAGES[feature];
  } else if (progress && total && parseInt(progress) >= parseInt(total)) {
    messages = FEEDBACK_MESSAGES.completion;
  } else {
    messages = ["Great job!", "Keep going!", "You're doing amazing!"];
  }
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  res.json({ text: randomMessage });
});

// Session logging endpoint
app.post('/api/log-session', (req, res) => {
  const { template, totalDots, completedDots, sessionDuration, undos, features } = req.body;
  
  const sessionLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    template,
    totalDots,
    completedDots,
    sessionDuration, // in seconds
    undos,
    features,
    completionRate: completedDots / totalDots
  };
  
  sessionLogs.push(sessionLog);
  console.log('Session logged:', sessionLog);
  
  res.json({ success: true, sessionId: sessionLog.id });
});

// Get session analytics (for admin dashboard)
app.get('/api/analytics', (req, res) => {
  const totalSessions = sessionLogs.length;
  const avgCompletionRate = sessionLogs.reduce((sum, log) => sum + log.completionRate, 0) / totalSessions || 0;
  const avgSessionDuration = sessionLogs.reduce((sum, log) => sum + log.sessionDuration, 0) / totalSessions || 0;
  const templateUsage = {};
  
  sessionLogs.forEach(log => {
    templateUsage[log.template] = (templateUsage[log.template] || 0) + 1;
  });
  
  res.json({
    totalSessions,
    avgCompletionRate: Math.round(avgCompletionRate * 100),
    avgSessionDuration: Math.round(avgSessionDuration),
    templateUsage,
    recentSessions: sessionLogs.slice(-10) // Last 10 sessions
  });
});

// --- Invite Token Validation ---
const VALID_TOKENS = [
  'b7f3e2c1-9a4d-4e2b-8c1a-2f3d4e5b6a7c',
  'e8d2f1a9-3c4b-4e7d-9f2a-1b2c3d4e5f6a',
  'c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'f6e5d4c3-b2a1-0f9e-8d7c-6b5a4e3d2c1b'
];

app.get('/api/validate-token', (req, res) => {
  const { token } = req.query;
  if (token && VALID_TOKENS.includes(token)) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'wireframe_mockup.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`App available at: http://localhost:${PORT}/wireframe_mockup.html?template=child&token=b7f3e2c1-9a4d-4e2b-8c1a-2f3d4e5b6a7c`);
}); 