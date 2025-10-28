import type React from "react"
const styles = {
  container: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  } as React.CSSProperties,
  content: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  } as React.CSSProperties,
  icon: {
    fontSize: "20px",
  } as React.CSSProperties,
  title: {
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: "4px",
  } as React.CSSProperties,
  message: {
    fontSize: "14px",
    color: "rgba(220, 38, 38, 0.8)",
  } as React.CSSProperties,
}

interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <span style={styles.icon}>⚠️</span>
        <div>
          <h3 style={styles.title}>Search Error</h3>
          <p style={styles.message}>{message}</p>
        </div>
      </div>
    </div>
  )
}
