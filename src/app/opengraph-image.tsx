import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getGames, getSite } from "@/lib/content";

export const runtime = "nodejs";
export const alt = "MalakaTV — Builds, guias e farms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function getAvatarDataUrl(): string {
  const filePath = path.join(process.cwd(), "public", "images", "malaka-profile.jpg");
  const buffer = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

export default async function OpenGraphImage() {
  const [site, games] = await Promise.all([getSite(), getGames()]);
  const avatarSrc = getAvatarDataUrl();
  const gamesLabel = games.map((game) => game.shortName).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          color: "#0e0f0c",
          padding: "56px 68px",
          borderTop: "16px solid #9fe870",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em" }}>Malaka</span>
            <span
              style={{
                backgroundColor: "#9fe870",
                color: "#0e0f0c",
                fontSize: "18px",
                fontWeight: 800,
                padding: "6px 16px",
                borderRadius: "999px",
                letterSpacing: "0.08em",
              }}
            >
              TV
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#e2f6d5",
              color: "#054d28",
              fontSize: "20px",
              fontWeight: 700,
              padding: "10px 22px",
              borderRadius: "999px",
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "42px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc}
            alt=""
            width={176}
            height={176}
            style={{
              width: "176px",
              height: "176px",
              borderRadius: "999px",
              objectFit: "cover",
              border: "6px solid #9fe870",
              flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "820px" }}>
            <div
              style={{
                fontSize: "58px",
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                color: "#0e0f0c",
              }}
            >
              {site.heroTitle}
            </div>
            <div
              style={{
                fontSize: "26px",
                lineHeight: 1.35,
                color: "#454745",
              }}
            >
              {site.bio}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "22px",
            borderTop: "2px solid rgba(14, 15, 12, 0.1)",
            fontSize: "22px",
            fontWeight: 700,
            color: "#454745",
          }}
        >
          <span>{gamesLabel ? `${gamesLabel} · pt-BR` : "ARPG · pt-BR"}</span>
          <span>{site.handle}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
