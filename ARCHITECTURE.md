# Book Finder - Application Architecture

## System Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE (React)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              app/page.jsx (Main Page)                    │   │
│  │  - State Management (useState, useEffect)                │   │
│  │  - Manages: books, loading, error, searchQuery           │   │
│  │  - Coordinates all child components                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│         ┌────────────────────┼────────────────────┐              │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ search-bar.jsx  │ │ book-grid.jsx   │ │error-message.jsx│   │
│  │ - Input field   │ │ - Maps books    │ │ - Error display │   │
│  │ - Search type   │ │ - Grid layout   │ │                 │   │
│  │ - Quick buttons │ │                 │ │                 │   │
│  └─────────────────┘ └────────┬────────┘ └─────────────────┘   │
│                               │                                  │
│                               ▼                                  │
│                    ┌──────────────────────┐                     │
│                    │  book-card.jsx       │                     │
│                    │  - Book display      │                     │
│                    │  - Expandable info   │                     │
│                    │  - Cover image       │                     │
│                    └──────────────────────┘                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         loading-spinner.jsx                              │   │
│  │         - Loading animation                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST │ API Calls
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python/Flask)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           api/search_books.py                            │   │
│  │  - BookSearchAPI class                                   │   │
│  │  - Methods:                                              │   │
│  │    • search_by_title(title)                              │   │
│  │    • search_by_author(author)                            │   │
│  │    • search_by_isbn(isbn)                                │   │
│  │  - Error handling & data transformation                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         External API Integration                         │   │
│  │  - Open Library Search API                               │   │
│  │  - URL: https://openlibrary.org/search.json              │   │
│  │  - Returns: Book data, covers, metadata                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

## Data Flow

### 1. User Search Flow
\`\`\`
User Input (SearchBar)
    ↓
State Update (searchQuery, searchType)
    ↓
API Call to Backend
    ↓
Python Backend processes request
    ↓
Open Library API call
    ↓
Data transformation & validation
    ↓
Response sent to Frontend
    ↓
State Update (books, loading=false)
    ↓
BookGrid renders results
    ↓
User sees book cards
\`\`\`

### 2. Component Communication
\`\`\`
page.jsx (Parent)
├── Passes: books, loading, error, searchQuery
├── Receives: onSearch callback
│
├── search-bar.jsx
│   └── Triggers: onSearch(query, type)
│
├── book-grid.jsx
│   ├── Maps through books array
│   └── Renders: book-card.jsx (multiple)
│       └── Shows: title, author, cover, year
│
├── loading-spinner.jsx
│   └── Shows when: loading === true
│
└── error-message.jsx
    └── Shows when: error !== null
\`\`\`

## File Structure

\`\`\`
book-finder/
├── app/
│   ├── layout.jsx          # Root layout
│   ├── page.jsx            # Main page (state management)
│   ├── globals.css         # Global styles
│   └── loading.jsx         # Loading component
│
├── components/
│   ├── search-bar.jsx      # Search input & filters
│   ├── book-grid.jsx       # Grid container
│   ├── book-card.jsx       # Individual book card
│   ├── loading-spinner.jsx # Loading animation
│   └── error-message.jsx   # Error display
│
├── api/
│   ├── search_books.py     # Python backend logic
│   └── requirements.txt    # Python dependencies
│
├── types/
│   └── book.js             # Book data structure
│
└── styles/
    └── (CSS modules if needed)
\`\`\`

## State Management (React Hooks)

### Main State in page.jsx
\`\`\`javascript
const [searchQuery, setSearchQuery] = useState('');
const [searchType, setSearchType] = useState('title');
const [books, setBooks] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [expandedBookId, setExpandedBookId] = useState(null);
\`\`\`

### State Flow
- **searchQuery**: User's input text
- **searchType**: 'title' | 'author' | 'isbn'
- **books**: Array of book objects from API
- **loading**: Boolean for loading state
- **error**: Error message or null
- **expandedBookId**: ID of expanded book card

## API Integration

### Frontend → Backend Communication
\`\`\`javascript
// Frontend (React)
const handleSearch = async (query, type) => {
  setLoading(true);
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, type })
    });
    const data = await response.json();
    setBooks(data.books);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
\`\`\`

### Backend (Python)
\`\`\`python
# Python Backend
from api.search_books import BookSearchAPI

api = BookSearchAPI()

# Search by title
results = api.search_by_title('The Great Gatsby')

# Search by author
results = api.search_by_author('F. Scott Fitzgerald')

# Search by ISBN
results = api.search_by_isbn('9780743273565')
\`\`\`

## Key Features

### Frontend Features
- ✓ Multiple search types (title, author, ISBN)
- ✓ Quick search buttons for popular books
- ✓ Expandable book cards with details
- ✓ Loading spinner during API calls
- ✓ Error handling and display
- ✓ Responsive design (mobile, tablet, desktop)
- ✓ Book cover images from Open Library

### Backend Features
- ✓ API request handling
- ✓ Data validation and transformation
- ✓ Error handling for network issues
- ✓ Caching support (optional)
- ✓ Rate limiting (optional)

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 | UI components & state management |
| Frontend | JSX | Component syntax |
| Frontend | CSS | Styling |
| Backend | Python 3.8+ | API logic |
| Backend | Flask/FastAPI | Web framework (optional) |
| External | Open Library API | Book data source |

## Development Workflow

1. **Frontend Development**
   - Edit React components in `components/`
   - Update state management in `app/page.jsx`
   - Test UI changes in browser

2. **Backend Development**
   - Edit Python logic in `api/search_books.py`
   - Test API endpoints locally
   - Validate data transformation

3. **Integration**
   - Connect frontend API calls to backend endpoints
   - Test end-to-end flow
   - Handle errors gracefully

## Next Steps

1. Set up Python backend server (Flask/FastAPI)
2. Create API endpoints for search operations
3. Connect React frontend to backend API
4. Add database for caching (optional)
5. Deploy frontend and backend separately
6. Add authentication (optional)
7. Implement advanced features (filters, sorting, etc.)
