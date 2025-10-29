# Book Finder App

A React-based book search application that uses the Open Library API to search for books by title, author, or ISBN.

## Features

- Search books by title, author, or ISBN
- View book covers, details, and metadata
- Quick search buttons for popular books
- Responsive design for mobile and desktop
- Direct API integration (no backend required)
  supabase is used where we have security as well 
  generates jwt token and then proceses no server code need to be writtten seperately , if we use supa database
- Python backend available for advanced use cases
- it works like netflix when user a reads book a and book b user b reads a ,book b will be recommended
  collaborative filtering
   >>note:only who will signup and login will be recommended

## How to Run in VS Code

 1: React Frontend Only (Recommended)



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

### Option 2: With Python Backend 

 the Python backend for API calls:

1. **Install Python dependencies**
   \`\`\`bash
   cd api
   pip install -r requirements.txt
   \`\`\`

2. **Test the Python API**
   \`\`\`bash
   python search_books.py
   \`\`\`

3. **Create API endpoints** 
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
│   ├── search_books.py 
# Python backend (optional)
also recommendation by collaborative network filtering
│   └── requirements.txt  # Python dependencies
└── public/
    └── abstract-book-cover.png  # Fallback book cover
\`\`\`

## Current Setup

The app currently calls the Open Library API directly from the React frontend. The Python backend is available to execute the calls and fetch and will load

## Technologies Used

- React 19 with JSX
- Next.js 16
- Open Library API
- Python 3 (optional backend)

## Deployment

Your project is automatically deployed on Vercel and synced with v0.app.

**Live URL:** https://v0-task-list-ui-phi.vercel.app/
