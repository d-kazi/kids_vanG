# Kids VanG Dot-to-Dot Drawing App

An interactive web application that helps kids learn to draw by connecting dots to create fun characters like smiley faces, children, and superheroes.

## Features

- **Interactive Drawing**: Connect dots to reveal hidden pictures
- **Voice Feedback**: Encouraging voice prompts at key moments
- **Multiple Templates**: Smiley face, child's face, and Spider-Man superhero
- **Progress Tracking**: Visual feedback and completion animations
- **Session Analytics**: Track usage and completion rates
- **Responsive Design**: Works on desktop and mobile devices

## Live Demo

[Your deployed URL will go here]

## Local Development

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd kids_vanG
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   - Smiley: http://localhost:3000/?template=smiley&token=b7f3e2c1-9a4d-4e2b-8c1a-2f3d4e5b6a7c
   - Child: http://localhost:3000/?template=child&token=b7f3e2c1-9a4d-4e2b-8c1a-2f3d4e5b6a7c
   - Hero: http://localhost:3000/?template=hero&token=b7f3e2c1-9a4d-4e2b-8c1a-2f3d4e5b6a7c

## Deployment

### Option 1: Render (Recommended)
1. Sign up at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variable: `PORT=10000`

### Option 2: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Deploy automatically

### Option 3: Vercel
1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure for Node.js deployment

## Project Structure

```
kids_vanG/
├── server.js              # Express server and API endpoints
├── wireframe_mockup.html  # Main frontend application
├── admin.html             # Admin dashboard for analytics
├── templates/             # Drawing templates (JSON files)
│   ├── smiley.json       # Smiley face template
│   ├── child.json        # Child's face template
│   └── hero.json         # Spider-Man superhero template
├── logs/                  # Session logs (auto-generated)
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## API Endpoints

- `GET /` - Main application
- `GET /admin` - Admin dashboard
- `GET /api/feedback` - Voice feedback messages
- `POST /api/log-session` - Log drawing sessions
- `GET /api/analytics` - Get session analytics
- `GET /api/validate-token` - Validate access tokens

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5 Canvas, JavaScript, CSS3
- **Voice**: Web Speech API
- **Data**: JSON files, file system storage
- **Styling**: Modern CSS with animations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License

This license allows others to:
- ✅ Share and redistribute your work
- ✅ Give you proper credit

But prevents them from:
- ❌ Using it commercially
- ❌ Modifying or creating derivatives
- ❌ Distributing modified versions

For commercial use or modifications, please contact the copyright holder for permission.

See [LICENSE](LICENSE) file for full details.

## Support

For questions or support, please open an issue in the GitHub repository. 