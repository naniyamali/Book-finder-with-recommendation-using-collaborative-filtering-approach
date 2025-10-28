"use client"

import type React from "react"

import { useState } from "react"
import type { Book } from "@/types/book"

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column" as const,
  } as React.CSSProperties,
  coverContainer: {
    position: "relative" as const,
    width: "100%",
    paddingBottom: "150%",
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  } as React.CSSProperties,
  coverImage: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  } as React.CSSProperties,
  coverOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1))",
  } as React.CSSProperties,
  infoContainer: {
    padding: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
  } as React.CSSProperties,
  title: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "4px",
    lineHeight: "1.4",
  } as React.CSSProperties,
  author: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "12px",
  } as React.CSSProperties,
  quickInfo: {
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  } as React.CSSProperties,
  detailsButton: {
    padding: "8px 12px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: "auto",
  } as React.CSSProperties,
  detailsContainer: {
    padding: "16px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  detailsLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "4px",
  } as React.CSSProperties,
  detailsText: {
    fontSize: "13px",
    color: "#374151",
    lineHeight: "1.5",
  } as React.CSSProperties,
  detailsLink: {
    fontSize: "13px",
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.2s",
    cursor: "pointer",
  } as React.CSSProperties,
}

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [imageError, setImageError] = useState(false)

  const coverUrl = book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
    : "/abstract-book-cover.png"

  return (
    <div style={styles.card}>
      {/* Book Cover */}
      <div style={styles.coverContainer}>
        <img
          src={imageError ? "/abstract-book-cover.png" : coverUrl}
          alt={book.title}
          style={styles.coverImage}
          onError={() => setImageError(true)}
        />
        <div style={styles.coverOverlay} />
      </div>

      {/* Book Info */}
      <div style={styles.infoContainer}>
        <h3 style={styles.title}>{book.title}</h3>
        <p style={styles.author}>{book.author}</p>

        {/* Quick Info */}
        <div style={styles.quickInfo}>
          <p>Year: {book.year}</p>
          <p>Pages: {book.pages}</p>
          {book.isbn !== "N/A" && <p>ISBN: {book.isbn}</p>}
        </div>

        {/* Details Toggle */}
        <button onClick={() => setShowDetails(!showDetails)} style={styles.detailsButton}>
          {showDetails ? "Hide Details" : "View Details"}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div style={styles.detailsContainer}>
          <div>
            <p style={styles.detailsLabel}>Description</p>
            <p style={styles.detailsText}>{book.description}</p>
          </div>
          {book.authors.length > 1 && (
            <div>
              <p style={styles.detailsLabel}>All Authors</p>
              <p style={styles.detailsText}>{book.authors.join(", ")}</p>
            </div>
          )}
          <a
            href={`https://openlibrary.org${book.key}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.detailsLink}
          >
            View on Open Library →
          </a>
        </div>
      )}
    </div>
  )
}
