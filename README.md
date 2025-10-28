# Book Finder App

A React-based book search application that uses the Open Library API to search for books by title, author, or ISBN.

## Features

- Search books by title, author, or ISBN
- View book covers, details, and metadata
- Quick search buttons for popular books
- Responsive design for mobile and desktop
- Direct API integration (no backend required)
- Python backend available for advanced use cases

## How to Run in VS Code

### Option 1: React Frontend Only (Recommended)

1. **Download the project**
   - Click the three dots in v0 interface → Download ZIP
   - Extract and open in VS Code

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in browser**
   - Navigate to `http://localhost:3000`

### Option 2: With Python Backend (Optional)

If you want to use the Python backend for API calls:

1. **Install Python dependencies**
   \`\`\`bash
   cd api
   pip install -r requirements.txt
   \`\`\`

2. **Test the Python API**
   \`\`\`bash
   python search_books.py
   \`\`\`

3. **Create API endpoints** (you'll need to add Flask/FastAPI)
   - The Python file provides the BookSearchAPI class
   - You can wrap it with Flask or FastAPI to create REST endpoints

## Project Structure

\`\`\`
book-finder/
├── app/
│   ├── page.jsx          # Main Book Finder component
│   ├── layout.jsx        # App layout wrapper
│   └── globals.css       # Global styles
├── api/
│   ├── search_books.py   # Python backend (optional)
│   └── requirements.txt  # Python dependencies
└── public/
    └── abstract-book-cover.png  # Fallback book cover
\`\`\`

## Current Setup

The app currently calls the Open Library API directly from the React frontend. The Python backend is available but not integrated by default.

## Technologies Used

- React 19 with JSX
- Next.js 16
- Open Library API
- Python 3 (optional backend)

## Deployment

Your project is automatically deployed on Vercel and synced with v0.app.

**Live URL:** [https://vercel.com/is10nani12-7211s-projects/v0-task-list-ui](https://vercel.com/is10nani12-7211s-projects/v0-task-list-ui)

**Continue building:** [https://v0.app/chat/projects/6AD4Sw2cqin](https://v0.app/chat/projects/6AD4Sw2cqin)
