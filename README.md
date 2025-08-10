# FilterFast

FilterFast is a fast applicant screening tool that fetches and scores GitHub profiles so event organizers can find the best talent instantly.

## Overview

FilterFast helps event organizers quickly evaluate GitHub applicants by:
- Fetching comprehensive GitHub profile data
- Calculating a weighted score based on followers, repositories, and stars
- Displaying results in a clean, organized interface
- Providing instant insights for decision-making

## Features

- **GitHub Profile Analysis**: Fetches user profile, repositories, and metrics
- **Smart Scoring Algorithm**: Calculates weighted scores based on multiple factors
- **Repository Insights**: Shows repository languages, star counts, and more
- **Social Links**: Aggregates public links from GitHub profile (Website/Blog, Twitter, Email, and connected social accounts)
- **Clean UI**: Modern, responsive design for easy data consumption
- **Real-time Data**: Live GitHub API integration for up-to-date information

## Project Structure

```
filter-fast/
├── backend/                 # Express.js backend server
│   ├── package.json        # Backend dependencies
│   └── server.js          # Express server with GitHub API
└── frontend/               # React frontend application
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite configuration
    ├── index.html          # Main HTML file
    └── src/
        ├── main.jsx        # React entry point
        ├── App.jsx         # Main application component
        └── index.css       # Global styles
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Enter a GitHub username in the search box
3. Click "Fetch Profile" or press Enter
4. View the applicant's profile data, metrics, score, and social links
5. Analyze repositories, languages, and star counts

## API Endpoints

### GET /api/github/:username

Fetches and analyzes a GitHub user profile.

**Response:**
```json
{
  "username": "string",
  "name": "string",
  "avatar_url": "string",
  "followers": 0,
  "publicReposCount": 0,
  "totalStars": 0,
  "score": 0,
  "repos": [
    { "name": "string", "stars": 0, "language": "string" }
  ],
  "socialLinks": [
    { "label": "GitHub|Website|Twitter|Email|...", "url": "string" }
  ]
}
```

Notes:
- `socialLinks` aggregates public links from the profile (`html_url`, `blog`, `twitter_username`, `email`) and GitHub `social_accounts` when available.
- Some users may not expose social links; the array can be empty.

## Scoring Algorithm

The applicant score is calculated using:
```
Score = (Followers × 2) + (Public Repos × 1.5) + Total Stars
```

This weighted formula prioritizes:
- **Social Proof**: Followers indicate community recognition
- **Activity Level**: Repository count shows consistent contribution
- **Quality**: Star count reflects project value and popularity

## Technologies Used

- **Backend**: Node.js, Express.js, Axios
- **Frontend**: React, Vite, CSS3
- **APIs**: GitHub REST API
- **Features**: CORS enabled, responsive design, error handling

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

### Building for Production
```bash
cd frontend
npm run build
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue in the repository.
