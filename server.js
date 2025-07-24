const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/feedback', (req, res) => {
  res.json({ text: 'Great job!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 