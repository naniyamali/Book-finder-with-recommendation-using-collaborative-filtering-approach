import type React from "react"
const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 16px",
  } as React.CSSProperties,
  spinnerWrapper: {
    position: "relative" as const,
    width: "48px",
    height: "48px",
    marginBottom: "16px",
  } as React.CSSProperties,
  spinnerBg: {
    position: "absolute" as const,
    inset: 0,
    borderRadius: "50%",
    border: "4px solid #e5e7eb",
  } as React.CSSProperties,
  spinnerFg: {
    position: "absolute" as const,
    inset: 0,
    borderRadius: "50%",
    border: "4px solid transparent",
    borderTopColor: "#3b82f6",
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,
  text: {
    color: "#6b7280",
    fontSize: "14px",
  } as React.CSSProperties,
}

export default function LoadingSpinner() {
  return (
    <>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinnerBg} />
          <div style={styles.spinnerFg} />
        </div>
        <p style={styles.text}>Searching for books...</p>
      </div>
    </>
  )
}
