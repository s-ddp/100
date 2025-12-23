"use client";

import { useState } from "react";
import { apiAddBoatImage, apiDeleteBoatImage } from "@/app/lib/api";

export default function BoatImagesEditor({
  boatId,
  images,
  onChange,
}: {
  boatId: string;
  images: any[];
  onChange: () => void;
}) {
  const [url, setUrl] = useState("");

  async function add() {
    if (!url) return;
    await apiAddBoatImage(boatId, url);
    setUrl("");
    onChange();
  }

  async function remove(id: string) {
    await apiDeleteBoatImage(id);
    onChange();
  }

  return (
    <section style={block}>
      <h2>Фотографии</h2>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="URL изображения"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={add}>Добавить</button>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {images.map((img) => (
          <div key={img.id} style={thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 8 }} />
            <button onClick={() => remove(img.id)} style={del}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

const block: React.CSSProperties = {
  marginTop: 32,
  padding: 16,
  border: "1px solid #2a2f3a",
  borderRadius: 12,
};

const thumb: React.CSSProperties = {
  position: "relative",
};

const del: React.CSSProperties = {
  position: "absolute",
  top: 4,
  right: 4,
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  borderRadius: 6,
  padding: "2px 6px",
};
