import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-2px",
          }}
        >
          FKTR
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 36,
            fontWeight: 600,
            color: "#2563eb",
          }}
        >
          fakturuj v klidu
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 24,
            color: "#475569",
          }}
        >
          Minimalistická appka pro vystavení faktur
        </div>
      </div>
    ),
    size
  );
}
