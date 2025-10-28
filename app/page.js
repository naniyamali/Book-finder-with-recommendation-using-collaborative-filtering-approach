"use client"

import { useState } from "react"
import SearchBar from "@/components/search-bar"
import BookGrid from "@/components/book-grid"
import LoadingSpinner from "@/components/loading-spinner"
import ErrorMessage from "@/components/error-message"

const styles = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #ffffff, #f8f9fa, #f0f4f8)",
  },
  header: {
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  headerContent: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "24px 16px",
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  logoBox: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(to bottom right, #3b82f6, #1e40af)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  searchSection: {
    background: "linear-gradient(to bottom, rgba(59, 130, 246, 0.05), transparent)",
    padding: "48px 16px",
    borderBottom: "1px solid #e5e7eb",
  },
  searchContainer: {
    maxWidth: "896px",
    margin: "0 auto",
  },
  resultsSection: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "48px 16px",
  },
  noResults: {
    textAlign: "center",
    padding: "48px 16px",
    color: "#6b7280",
  },
  resultCount: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  resultCountBold: {
    fontWeight: "600",
    color: "#1f2937",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 16px",
  },
  emptyIcon: {
    fontSize: "96px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "8px",
  },
  emptyText: {
    color: "#6b7280",
    maxWidth: "448px",
    margin: "0 auto",
  },
  footer: {
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginTop: "48px",
  },
  footerContent: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "32px 16px",
  },
  footerText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
  },
  footerLink: {
    color: "#3b82f6",
    textDecoration: "none",
    transition: "color 0.2s",
    cursor: "pointer",
  },
}

export default function Home() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query, searchType) => {
    if (!query.trim()) {
      setError("Please enter a search term")
      return
    }

    setLoading(true)
    setError(null)
    setBooks([])
    setHasSearched(true)

    try {
      // Build the API URL based on search type
      let apiUrl = "https://openlibrary.org/search.json?"

      if (searchType === "title") {
        apiUrl += `title=${encodeURIComponent(query)}`
      } else if (searchType === "author") {
        apiUrl += `author=${encodeURIComponent(query)}`
      } else if (searchType === "isbn") {
        apiUrl += `isbn=${encodeURIComponent(query)}`
      }

      // Add limit to get reasonable number of results
      apiUrl += "&limit=20"

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error("Failed to fetch books from Open Library")
      }

      const data = await response.json()

      if (!data.docs || data.docs.length === 0) {
        setError(`No books found for "${query}". Try a different search term.`)
        setBooks([])
        return
      }

      // Transform API response to our Book type
      const transformedBooks = data.docs.map((doc) => ({
        key: doc.key,
        title: doc.title || "Unknown Title",
        author: doc.author_name?.[0] || "Unknown Author",
        authors: doc.author_name || [],
        year: doc.first_publish_year || "N/A",
        isbn: doc.isbn?.[0] || "N/A",
        coverId: doc.cover_i,
        description: doc.description || "No description available",
        pages: doc.number_of_pages_median || "N/A",
        language: doc.language?.[0] || "en",
      }))

      setBooks(transformedBooks)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(`Error: ${errorMessage}. Please try again.`)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={styles.main}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTop}>
            <div style={styles.logoBox}>
              <span style={styles.logoEmoji}>📚</span>
            </div>
            <h1 style={styles.title}>BookFinder</h1>
          </div>
          <p style={styles.subtitle}>Discover millions of books from Open Library</p>
        </div>
      </header>

      {/* Search Section */}
      <section style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <SearchBar onSearch={handleSearch} isLoading={loading} />
        </div>
      </section>

      {/* Results Section */}
      <section style={styles.resultsSection}>
        {loading && <LoadingSpinner />}

        {error && <ErrorMessage message={error} />}

        {!loading && !error && hasSearched && books.length === 0 && (
          <div style={styles.noResults}>
            <p>No results found. Try adjusting your search.</p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <div>
            <p style={styles.resultCount}>
              Found <span style={styles.resultCountBold}>{books.length}</span> books
            </p>
            <BookGrid books={books} />
          </div>
        )}

        {!hasSearched && !loading && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📖</div>
            <h2 style={styles.emptyTitle}>Start Your Search</h2>
            <p style={styles.emptyText}>
              Search by book title, author name, or ISBN to discover your next favorite read.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            Powered by{" "}
            <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              Open Library
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
