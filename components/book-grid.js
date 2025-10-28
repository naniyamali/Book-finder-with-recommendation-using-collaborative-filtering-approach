"use client"

import BookCard from "./book-card"

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
}

export default function BookGrid({ books }) {
  return (
    <div style={styles.grid}>
      {books.map((book) => (
        <BookCard key={book.key} book={book} />
      ))}
    </div>
  )
}
