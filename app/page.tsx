"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Book {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
  number_of_pages_median?: number
  first_sentence?: string[]
  publisher?: string[]
  isbn?: string[]
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"title" | "author" | "isbn">("title")
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null)

  const [user, setUser] = useState<User | null>(null)
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  const searchBooks = async (query: string, type: string) => {
    if (!query.trim()) {
      setBooks([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      let url = ""
      if (type === "title") {
        url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=20`
      } else if (type === "author") {
        url = `https://openlibrary.org/search.json?author=${encodeURIComponent(query)}&limit=20`
      } else if (type === "isbn") {
        url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(query)}&limit=20`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.docs && data.docs.length > 0) {
        setBooks(data.docs)
      } else {
        setBooks([])
        setError("No books found")
      }
    } catch (err) {
      setError("Failed to fetch books. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchBooks(searchQuery, searchType)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, searchType])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadRecommendations()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadRecommendations()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleBookDetails = (bookKey: string) => {
    setExpandedBookId(expandedBookId === bookKey ? null : bookKey)
  }

  const loadRecommendations = async () => {
    setLoadingRecommendations(true)
    try {
      // For now, load some popular books as recommendations
      // In production, this would call your recommendation API
      const response = await fetch("https://openlibrary.org/search.json?q=bestseller&limit=6")
      const data = await response.json()
      if (data.docs) {
        setRecommendations(data.docs)
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const quickSearches = [
    { label: "Harry Potter", query: "Harry Potter", type: "title" as const },
    { label: "J.K. Rowling", query: "J.K. Rowling", type: "author" as const },
    { label: "The Hobbit", query: "The Hobbit", type: "title" as const },
    { label: "Stephen King", query: "Stephen King", type: "author" as const },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1a1a1a" }}>
            📚 Book Finder
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#6c757d" }}>Discover millions of books from the Open Library</p>
          {user && (
            <p style={{ fontSize: "1rem", color: "#0066cc", marginTop: "0.5rem" }}>Welcome back, {user.email}!</p>
          )}
        </div>

        {user && (
          <Card
            style={{
              marginBottom: "2rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "white" }}>Recommended for You</CardTitle>
              <CardDescription style={{ color: "rgba(255,255,255,0.9)" }}>
                Based on your reading history and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRecommendations ? (
                <div style={{ textAlign: "center", padding: "1rem" }}>
                  <p>Loading recommendations...</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {recommendations.slice(0, 6).map((book) => (
                    <div
                      key={book.key}
                      style={{
                        background: "white",
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onClick={() => {
                        setSearchQuery(book.title)
                        setSearchType("title")
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      {book.cover_i ? (
                        <img
                          src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                          alt={book.title}
                          style={{ width: "100%", height: "120px", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "120px",
                            background: "#e9ecef",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.75rem", color: "#6c757d" }}>No cover</span>
                        </div>
                      )}
                      <div style={{ padding: "0.5rem" }}>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            color: "#1a1a1a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {book.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Section */}
        <Card style={{ marginBottom: "2rem" }}>
          <CardHeader>
            <CardTitle>Search Books</CardTitle>
            <CardDescription>Search by title, author, or ISBN</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Type Toggle */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <Button
                variant={searchType === "title" ? "default" : "outline"}
                onClick={() => setSearchType("title")}
                size="sm"
              >
                Title
              </Button>
              <Button
                variant={searchType === "author" ? "default" : "outline"}
                onClick={() => setSearchType("author")}
                size="sm"
              >
                Author
              </Button>
              <Button
                variant={searchType === "isbn" ? "default" : "outline"}
                onClick={() => setSearchType("isbn")}
                size="sm"
              >
                ISBN
              </Button>
            </div>

            {/* Search Input */}
            <Input
              type="text"
              placeholder={`Search by ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            {/* Quick Search Buttons */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.875rem", color: "#6c757d", marginRight: "0.5rem" }}>Quick search:</span>
              {quickSearches.map((search) => (
                <Badge
                  key={search.label}
                  variant="secondary"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSearchType(search.type)
                    setSearchQuery(search.query)
                  }}
                >
                  {search.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e9ecef",
                borderTop: "4px solid #0066cc",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ marginTop: "1rem", color: "#6c757d" }}>Searching books...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: "1rem",
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: "0.5rem",
              color: "#c33",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Books Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {books.map((book) => {
            const isExpanded = expandedBookId === book.key

            return (
              <Card
                key={book.key}
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  height: isExpanded ? "auto" : "fit-content",
                }}
                onClick={() => toggleBookDetails(book.key)}
              >
                <CardHeader style={{ padding: 0 }}>
                  {book.cover_i ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                      alt={book.title}
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                        borderTopLeftRadius: "0.5rem",
                        borderTopRightRadius: "0.5rem",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "300px",
                        background: "#e9ecef",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderTopLeftRadius: "0.5rem",
                        borderTopRightRadius: "0.5rem",
                      }}
                    >
                      <span style={{ color: "#6c757d" }}>No cover available</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent style={{ padding: "1rem" }}>
                  <CardTitle style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>{book.title}</CardTitle>
                  {book.author_name && (
                    <CardDescription style={{ marginBottom: "0.5rem" }}>
                      by {book.author_name.slice(0, 2).join(", ")}
                    </CardDescription>
                  )}

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    {book.first_publish_year && (
                      <Badge variant="outline" style={{ fontSize: "0.75rem" }}>
                        {book.first_publish_year}
                      </Badge>
                    )}
                    {book.number_of_pages_median && (
                      <Badge variant="outline" style={{ fontSize: "0.75rem" }}>
                        {book.number_of_pages_median} pages
                      </Badge>
                    )}
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid #e9ecef",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
                      {book.first_sentence && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <strong style={{ fontSize: "0.875rem" }}>First Sentence:</strong>
                          <p style={{ fontSize: "0.875rem", color: "#6c757d", marginTop: "0.25rem" }}>
                            {book.first_sentence[0]}
                          </p>
                        </div>
                      )}
                      {book.publisher && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <strong style={{ fontSize: "0.875rem" }}>Publisher:</strong>
                          <p style={{ fontSize: "0.875rem", color: "#6c757d", marginTop: "0.25rem" }}>
                            {book.publisher.slice(0, 2).join(", ")}
                          </p>
                        </div>
                      )}
                      {book.author_name && book.author_name.length > 2 && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <strong style={{ fontSize: "0.875rem" }}>All Authors:</strong>
                          <p style={{ fontSize: "0.875rem", color: "#6c757d", marginTop: "0.25rem" }}>
                            {book.author_name.join(", ")}
                          </p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ width: "100%", marginTop: "0.5rem" }}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`https://openlibrary.org${book.key}`, "_blank")
                        }}
                      >
                        View on Open Library →
                      </Button>
                    </div>
                  )}

                  <Button
                    variant={isExpanded ? "secondary" : "default"}
                    size="sm"
                    style={{ width: "100%", marginTop: "0.75rem" }}
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {!loading && !error && books.length === 0 && searchQuery && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6c757d" }}>
            <p style={{ fontSize: "1.125rem" }}>No books found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}
