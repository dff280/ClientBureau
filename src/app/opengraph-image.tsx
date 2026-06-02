import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Client Bureau - Search client reports before you sign"
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
              Contractor Intelligence
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ maxWidth: 880, fontSize: 72, lineHeight: 1.02, fontWeight: 700 }}>
            Search client reports before you sign.
          </div>
          <div style={{ maxWidth: 900, color: "#cbd5e1", fontSize: 28, lineHeight: 1.35 }}>
            Moderated contractor-submitted reports, private matching, evidence-on-file summaries,
            and response context.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, color: "#f8fafc", fontSize: 20 }}>
          <span>Private matching</span>
          <span>Moderated summaries</span>
          <span>Evidence on file</span>
        </div>
      </div>
    ),
    size,
  )
}
