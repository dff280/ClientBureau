import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = {
  width: 64,
  height: 64,
}
export const contentType = "image/png"

export default function Icon() {
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
          border: "4px solid #d6a13d",
          borderRadius: 14,
          fontSize: 24,
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
