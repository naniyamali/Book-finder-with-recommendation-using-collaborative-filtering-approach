const styles = {
  container: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  content: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  icon: {
    fontSize: "20px",
  },
  title: {
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: "4px",
  },
  message: {
    fontSize: "14px",
    color: "rgba(220, 38, 38, 0.8)",
  },
}

export default function ErrorMessage({ message }) {
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
