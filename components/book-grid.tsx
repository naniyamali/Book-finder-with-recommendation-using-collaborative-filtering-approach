"use client"

import type React from "react"

import type { Book } from "@/types/book"
import BookCard from "./book-card"

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  } as React.CSSProperties,
}

interface BookGridProps {
  books: Book[]
}

export default function BookGrid({ books }: BookGridProps) {
  return (
    <div style={styles.grid}>
      {books.map((book) => (
        <BookCard key={book.key} book={book} />
      ))}
    </div>
  )
}
