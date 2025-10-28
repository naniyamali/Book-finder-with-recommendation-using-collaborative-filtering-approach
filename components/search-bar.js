"use client"

import { useState } from "react"

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    flex: 1,
    height: "48px",
    padding: "0 16px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
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
  },
  typeSelector: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  typeLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },
  typeButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  typeButtonActive: {
    backgroundColor: "#3b82f6",
    color: "white",
  },
  typeButtonInactive: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  },
  quickSearchContainer: {
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
  quickSearchLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "12px",
    fontWeight: "600",
  },
  quickSearchButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  quickButton: {
    padding: "6px 12px",
    fontSize: "12px",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "9999px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
}

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState("")
  const [searchType, setSearchType] = useState("title")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query, searchType)
  }

  const handleQuickSearch = (type, value) => {
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
          {["title", "author", "isbn"].map((type) => (
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
