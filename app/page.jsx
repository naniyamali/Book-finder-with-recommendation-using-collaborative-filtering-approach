"use client"

import { useState } from "react"

export default function BookFinder() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("title")
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedBookId, setExpandedBookId] = useState(null)

  const searchBooks = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term")
      return
    }

    setLoading(true)
    setError(null)
    setBooks([])

    try {
      let url = ""
      if (searchType === "title") {
        url = `https://openlibrary.org/search.json?title=${encodeURIComponent(searchQuery)}`
      } else if (searchType === "author") {
        url = `https://openlibrary.org/search.json?author=${encodeURIComponent(searchQuery)}`
      } else if (searchType === "isbn") {
        url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(searchQuery)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch books")
      }

      const data = await response.json()

      if (data.docs && data.docs.length > 0) {
        setBooks(data.docs.slice(0, 20))
      } else {
        setError("No books found. Try a different search term.")
      }
    } catch (err) {
      setError("Error fetching books. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchBooks()
    }
  }

  const quickSearch = (query, type) => {
    setSearchQuery(query)
    setSearchType(type)
    setTimeout(() => {
      const button = document.getElementById("search-button")
      if (button) button.click()
    }, 100)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Book Finder</h1>
        <p style={styles.subtitle}>Search millions of books from Open Library</p>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchTypeButtons}>
          <button
            onClick={() => setSearchType("title")}
            style={{
              ...styles.typeButton,
              ...(searchType === "title" ? styles.typeButtonActive : {}),
            }}
          >
            Title
          </button>
          <button
            onClick={() => setSearchType("author")}
            style={{
              ...styles.typeButton,
              ...(searchType === "author" ? styles.typeButtonActive : {}),
            }}
          >
            Author
          </button>
          <button
            onClick={() => setSearchType("isbn")}
            style={{
              ...styles.typeButton,
              ...(searchType === "isbn" ? styles.typeButtonActive : {}),
            }}
          >
            ISBN
          </button>
        </div>

        <div style={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Search by ${searchType}...`}
            style={styles.input}
          />
          <button
            id="search-button"
            onClick={searchBooks}
            disabled={loading}
            style={{
              ...styles.searchButton,
              ...(loading ? styles.searchButtonDisabled : {}),
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div style={styles.quickSearches}>
          <span style={styles.quickSearchLabel}>Quick searches:</span>
          <button onClick={() => quickSearch("Harry Potter", "title")} style={styles.quickButton}>
            Harry Potter
          </button>
          <button onClick={() => quickSearch("Tolkien", "author")} style={styles.quickButton}>
            Tolkien
          </button>
          <button onClick={() => quickSearch("1984", "title")} style={styles.quickButton}>
            1984
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <span style={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {loading && (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Searching for books...</p>
        </div>
      )}

      {!loading && books.length > 0 && (
        <div style={styles.grid}>
          {books.map((book, index) => {
            const coverId = book.cover_i
            const coverUrl = coverId
              ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
              : "/abstract-book-cover.png"

            const isExpanded = expandedBookId === book.key

            return (
              <div key={book.key || index} style={styles.card}>
                <img
                  src={coverUrl || "/placeholder.svg"}
                  alt={book.title}
                  style={styles.coverImage}
                  onError={(e) => {
                    e.target.src = "/abstract-book-cover.png"
                  }}
                />
                <div style={styles.cardContent}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.bookAuthor}>{book.author_name ? book.author_name.join(", ") : "Unknown Author"}</p>
                  <div style={styles.bookMeta}>
                    {book.first_publish_year && <span style={styles.metaItem}>📅 {book.first_publish_year}</span>}
                    {book.number_of_pages_median && (
                      <span style={styles.metaItem}>📖 {book.number_of_pages_median} pages</span>
                    )}
                  </div>

                  <button onClick={() => setExpandedBookId(isExpanded ? null : book.key)} style={styles.detailsButton}>
                    {isExpanded ? "Hide Details" : "Show Details"}
                  </button>

                  {isExpanded && (
                    <div style={styles.expandedContent}>
                      {book.first_sentence && (
                        <p style={styles.description}>
                          <strong>First Sentence:</strong> {book.first_sentence[0]}
                        </p>
                      )}
                      {book.publisher && (
                        <p style={styles.publisher}>
                          <strong>Publisher:</strong> {book.publisher.slice(0, 3).join(", ")}
                        </p>
                      )}
                      {book.isbn && (
                        <p style={styles.isbn}>
                          <strong>ISBN:</strong> {book.isbn[0]}
                        </p>
                      )}
                      <a
                        href={`https://openlibrary.org${book.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        View on Open Library →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
    padding: "2rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1.125rem",
    color: "#6c757d",
  },
  searchSection: {
    maxWidth: "800px",
    margin: "0 auto 3rem",
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  searchTypeButtons: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  typeButton: {
    flex: 1,
    padding: "0.75rem",
    border: "2px solid #dee2e6",
    background: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  typeButtonActive: {
    background: "#3498db",
    color: "white",
    borderColor: "#3498db",
  },
  searchBar: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  input: {
    flex: 1,
    padding: "0.875rem 1rem",
    border: "2px solid #dee2e6",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
  },
  searchButton: {
    padding: "0.875rem 2rem",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  searchButtonDisabled: {
    background: "#95a5a6",
    cursor: "not-allowed",
  },
  quickSearches: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  quickSearchLabel: {
    fontSize: "0.875rem",
    color: "#6c757d",
    fontWeight: "500",
  },
  quickButton: {
    padding: "0.375rem 0.75rem",
    background: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  error: {
    maxWidth: "800px",
    margin: "0 auto 2rem",
    padding: "1rem",
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    color: "#c33",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  errorIcon: {
    fontSize: "1.5rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  coverImage: {
    width: "100%",
    height: "300px",
    objectFit: "cover",
    background: "#f8f9fa",
  },
  cardContent: {
    padding: "1.25rem",
  },
  bookTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "0.5rem",
    lineHeight: "1.4",
  },
  bookAuthor: {
    fontSize: "0.875rem",
    color: "#6c757d",
    marginBottom: "0.75rem",
  },
  bookMeta: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  metaItem: {
    fontSize: "0.75rem",
    color: "#6c757d",
    background: "#f8f9fa",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
  },
  detailsButton: {
    width: "100%",
    padding: "0.5rem",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  expandedContent: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #dee2e6",
  },
  description: {
    fontSize: "0.875rem",
    color: "#495057",
    marginBottom: "0.75rem",
    lineHeight: "1.6",
  },
  publisher: {
    fontSize: "0.875rem",
    color: "#6c757d",
    marginBottom: "0.5rem",
  },
  isbn: {
    fontSize: "0.875rem",
    color: "#6c757d",
    marginBottom: "0.75rem",
  },
  link: {
    display: "inline-block",
    fontSize: "0.875rem",
    color: "#3498db",
    textDecoration: "none",
    fontWeight: "500",
  },
}
