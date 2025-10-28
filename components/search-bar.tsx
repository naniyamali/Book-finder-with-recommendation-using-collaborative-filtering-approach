"use client"

import type React from "react"
import { useState } from "react"

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  } as React.CSSProperties,
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as React.CSSProperties,
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  input: {
    flex: 1,
    height: "48px",
    padding: "0 16px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  } as React.CSSProperties,
  searchButton: {
    height: "48px",
    padding: "0 32px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  typeSelector: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    alignItems: "center",
  } as React.CSSProperties,
  typeLabel: {
    fontSize: "14px",
    color: "#6b7280",
  } as React.CSSProperties,
  typeButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  } as React.CSSProperties,
  typeButtonActive: {
    backgroundColor: "#3b82f6",
    color: "white",
  } as React.CSSProperties,
  typeButtonInactive: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  } as React.CSSProperties,
  quickSearchContainer: {
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  } as React.CSSProperties,
  quickSearchLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "12px",
    fontWeight: "600",
  } as React.CSSProperties,
  quickSearchButtons: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
  } as React.CSSProperties,
  quickButton: {
    padding: "6px 12px",
    fontSize: "12px",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "9999px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
}

interface SearchBarProps {
  onSearch: (query: string, searchType: "title" | "author" | "isbn") => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [searchType, setSearchType] = useState<"title" | "author" | "isbn">("title")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, searchType)
  }

  const handleQuickSearch = (type: "title" | "author" | "isbn", value: string) => {
    setSearchType(type)
    setQuery(value)
    onSearch(value, type)
  }

  return (
    <div style={styles.container}>
      {/* Main Search Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Search books..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            style={styles.input}
          />
          <button type="submit" disabled={isLoading || !query.trim()} style={styles.searchButton}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Search Type Selector */}
        <div style={styles.typeSelector}>
          <span style={styles.typeLabel}>Search by:</span>
          {(["title", "author", "isbn"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSearchType(type)}
              style={{
                ...styles.typeButton,
                ...(searchType === type ? styles.typeButtonActive : styles.typeButtonInactive),
              }}
              disabled={isLoading}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </form>

      {/* Quick Search Examples */}
      <div style={styles.quickSearchContainer}>
        <p style={styles.quickSearchLabel}>Quick searches:</p>
        <div style={styles.quickSearchButtons}>
          <button
            onClick={() => handleQuickSearch("title", "The Great Gatsby")}
            disabled={isLoading}
            style={styles.quickButton}
          >
            The Great Gatsby
          </button>
          <button
            onClick={() => handleQuickSearch("author", "J.K. Rowling")}
            disabled={isLoading}
            style={styles.quickButton}
          >
            J.K. Rowling
          </button>
          <button onClick={() => handleQuickSearch("title", "1984")} disabled={isLoading} style={styles.quickButton}>
            1984
          </button>
          <button
            onClick={() => handleQuickSearch("author", "Stephen King")}
            disabled={isLoading}
            style={styles.quickButton}
          >
            Stephen King
          </button>
        </div>
      </div>
    </div>
  )
}
