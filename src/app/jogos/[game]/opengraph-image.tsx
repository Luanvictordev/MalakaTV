import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getGame, getSite } from "@/lib/content";

export const runtime = "nodejs";
export const alt = "MalakaTV — Guias e builds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function getAvatarDataUrl(): string {
  const filePath = path.join(process.cwd(), "public", "images", "malaka-profile.jpg");
  const buffer = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

export default async function GameOpenGraphImage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: slug } = await params;
  const [site, game] = await Promise.all([getSite(), getGame(slug)]);
  const avatarSrc = getAvatarDataUrl();

  const isActive = game?.status === "ativo";
  const badgeText = game
    ? isActive
      ? game.releaseLabel || "Ativo"
      : `Em breve · ${game.releaseLabel || "Sem data"}`
    : site.tagline;
  const title = game?.name ?? site.name;
  const subtitle = game?.description ?? site.bio;
  const footerLeft = game ? `${game.shortName} · ${site.tagline} · pt-BR` : "ARPG · pt-BR";

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
              backgroundColor: isActive ? "#e2f6d5" : "#f2f5f7",
              color: isActive ? "#054d28" : "#454745",
              fontSize: "20px",
              fontWeight: 700,
              padding: "10px 22px",
              borderRadius: "999px",
            }}
          >
            {badgeText}
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
                fontSize: "62px",
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                color: "#0e0f0c",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "26px",
                lineHeight: 1.35,
                color: "#454745",
              }}
            >
              {subtitle}
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
          <span>{footerLeft}</span>
          <span>{site.handle}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
