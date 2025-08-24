const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// File-based session storage
const LOGS_FILE = path.join(__dirname, 'logs', 'sessions.json');
let sessionLogs = [];

// Ensure logs directory exists
function ensureLogsDirectory() {
  const logsDir = path.dirname(LOGS_FILE);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// Load existing logs from file
function loadSessionLogs() {
  try {
    ensureLogsDirectory();
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf8');
      sessionLogs = JSON.parse(data);
      console.log(`Loaded ${sessionLogs.length} existing session logs`);
    } else {
      sessionLogs = [];
      console.log('No existing logs found, starting fresh');
    }
  } catch (error) {
    console.error('Error loading session logs:', error);
    sessionLogs = [];
  }
}

// Save logs to file
function saveSessionLogs() {
  try {
    ensureLogsDirectory();
    fs.writeFileSync(LOGS_FILE, JSON.stringify(sessionLogs, null, 2));
    console.log(`Saved ${sessionLogs.length} session logs to file`);
  } catch (error) {
    console.error('Error saving session logs:', error);
  }
}

// Load logs on startup
loadSessionLogs();

// Enhanced feedback system with strategic moments
const FEEDBACK_MESSAGES = {
  start: {
    smiley: [
      "Great start! You're beginning to draw a happy smiley face!",
      "Excellent! You've started creating a wonderful smiley face!",
      "Perfect beginning! Your smiley face is taking shape!"
    ],
    child: [
      "Wonderful start! You're beginning to draw a cute child's face!",
      "Excellent! You've started creating a beautiful child's face!",
      "Perfect beginning! Your child's face is taking shape!"
    ],
    hero: [
      "Amazing start! You're beginning to draw a superhero mask!",
      "Excellent! You've started creating an awesome superhero mask!",
      "Perfect beginning! Your superhero mask is taking shape!"
    ]
  },
  middle: {
    smiley: [
      "You're halfway there! The smiley face is looking great!",
      "Keep going! You're doing an amazing job with the smiley face!",
      "Fantastic progress! The smiley face is really coming together!"
    ],
    child: [
      "You're halfway there! The child's face is looking wonderful!",
      "Keep going! You're doing an amazing job with the child's face!",
      "Fantastic progress! The child's face is really coming together!"
    ],
    hero: [
      "You're halfway there! The superhero mask is looking awesome!",
      "Keep going! You're doing an amazing job with the superhero mask!",
      "Fantastic progress! The superhero mask is really coming together!"
    ]
  },
  completion: {
    smiley: [
      "Congratulations! You've completed a beautiful smiley face!",
      "Amazing work! Your smiley face looks perfect and happy!",
      "Fantastic job! You've created a wonderful smiley face!"
    ],
    child: [
      "Congratulations! You've completed a beautiful child's face!",
      "Amazing work! Your child's face looks perfect and cute!",
      "Fantastic job! You've created a wonderful child's face!"
    ],
    hero: [
      "Congratulations! You've completed an awesome superhero mask!",
      "Amazing work! Your superhero mask looks perfect and powerful!",
      "Fantastic job! You've created an incredible superhero mask!"
    ]
  }
};

app.get('/api/feedback', (req, res) => {
  const { feedbackType, template } = req.query;
  
  let messages;
  if (feedbackType && FEEDBACK_MESSAGES[feedbackType]) {
    if (template && FEEDBACK_MESSAGES[feedbackType][template]) {
      messages = FEEDBACK_MESSAGES[feedbackType][template];
    } else {
      // Fallback to child template if template not found
      messages = FEEDBACK_MESSAGES[feedbackType].child;
    }
  } else {
    // Fallback messages
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
  
  // Save to file after each new session
  saveSessionLogs();
  
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

// Serve the admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`App available at: http://localhost:${PORT}/wireframe_mockup.html?template=child&token=b7f3e2c1-9a4d-4e2b-8c1a-2f3d4e5b6a7c`);
  console.log(`Session logs stored in: ${LOGS_FILE}`);
}); 