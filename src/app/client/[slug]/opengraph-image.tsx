import { ImageResponse } from "next/og"

import { getPublicClientProfileService } from "@/lib/repositories/client-bureau-service"

export const alt = "Client Bureau public client profile card"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

type ImageProps = {
  params: Promise<{ slug: string }>
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params
  const profile = await getPublicClientProfileService(slug)
  const name = profile ? `${profile.firstName} ${profile.lastName}` : "Client Bureau Profile"
  const location = profile ? `${profile.city}, ${profile.state}` : "Public client profile"
  const score = profile?.clientBureauScore ?? 0
  const riskLevel = profile?.riskLevel ?? "Moderate"
  const reportCount = profile?.reports.length ?? 0

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#06101d",
          color: "#ffffff",
          padding: 58,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
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
              <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>Client Bureau</div>
              <div style={{ display: "flex", color: "#d6a13d", fontSize: 18, textTransform: "uppercase" }}>
                Public Client Profile
              </div>
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(214,161,61,0.55)",
              borderRadius: 10,
              padding: "12px 18px",
              color: "#f8fafc",
              fontSize: 18,
              fontWeight: 700,
              display: "flex",
            }}
          >
            {riskLevel} Risk
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
            <div style={{ display: "flex", color: "#d6a13d", fontSize: 24, fontWeight: 700 }}>
              {location}
            </div>
            <div style={{ display: "flex", fontSize: 72, lineHeight: 1.02, fontWeight: 700 }}>
              {name}
            </div>
            <div style={{ display: "flex", color: "#cbd5e1", fontSize: 25, lineHeight: 1.35 }}>
              Moderated contractor-submitted summaries, response context, and evidence reviewed privately.
            </div>
          </div>

          <div
            style={{
              width: 250,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.08)",
              padding: 26,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", color: "#d6a13d", fontSize: 88, lineHeight: 1, fontWeight: 800 }}>
                {score}
              </div>
              <div style={{ display: "flex", color: "#cbd5e1", fontSize: 20, textTransform: "uppercase" }}>
                Score / 100
              </div>
            </div>
            <div style={{ display: "flex", height: 1, background: "rgba(255,255,255,0.18)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
              <span style={{ color: "#cbd5e1" }}>Reports</span>
              <span style={{ fontWeight: 700 }}>{reportCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
              <span style={{ color: "#cbd5e1" }}>Status</span>
              <span style={{ fontWeight: 700 }}>Public</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, color: "#e2e8f0", fontSize: 20 }}>
          <span>Contractor-submitted</span>
          <span>/</span>
          <span>Admin-approved</span>
          <span>/</span>
          <span>Right-of-response</span>
        </div>
      </div>
    ),
    size,
  )
}
