import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Client Bureau - Check the client before you take the job"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07111f",
          color: "white",
          padding: 64,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 12,
              border: "2px solid #d6a13d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d6a13d",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            CB
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>Client Bureau</div>
            <div style={{ color: "#d6a13d", fontSize: 18, textTransform: "uppercase" }}>
              Business Protection Platform
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ maxWidth: 880, fontSize: 72, lineHeight: 1.02, fontWeight: 700 }}>
            Check the client before you take the job.
          </div>
          <div style={{ maxWidth: 900, color: "#cbd5e1", fontSize: 28, lineHeight: 1.35 }}>
            Client risk intelligence, public reports, contracts, evidence records, payment tracking,
            and response workflows.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, color: "#f8fafc", fontSize: 20 }}>
          <span>Private matching</span>
          <span>Contract workflows</span>
          <span>Evidence Review</span>
        </div>
      </div>
    ),
    size,
  )
}
