import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07111f",
          color: "#d6a13d",
          border: "10px solid #d6a13d",
          borderRadius: 38,
          fontSize: 64,
          fontWeight: 800,
          fontFamily: "Arial",
        }}
      >
        CB
      </div>
    ),
    size,
  )
}
