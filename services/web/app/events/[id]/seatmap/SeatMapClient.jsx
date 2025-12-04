"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function wsUrl(path) {
  try {
    const url = new URL(API_URL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = path;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return `ws://localhost:4000${path}`;
  }
}

function statusColor(status, isSelected) {
  if (isSelected) return "#0ea5e9";
  switch (status) {
    case "sold":
      return "#b91c1c";
    case "reserved":
      return "#d97706";
    case "selected":
      return "#2563eb";
    case "free":
      return "#22c55e";
    default:
      return "#9ca3af";
  }
}

export default function SeatMapClient({ eventId }) {
  const sessionRef = useRef(`session-${Math.random().toString(16).slice(2)}`);
  const [layout, setLayout] = useState(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [seatStatus, setSeatStatus] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const dragRef = useRef({ active: false, x: 0, y: 0, startX: 0, startY: 0 });

  const currentLevel = useMemo(() => layout?.levels?.[levelIndex] ?? null, [layout, levelIndex]);

  const fetchLayout = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/seat-layout`, { cache: "no-store" });
      if (!res.ok) throw new Error("Не удалось загрузить схему");
      const data = await res.json();
      setLayout(data);
      setLevelIndex(0);
    } catch (err) {
      setError(err?.message || "Ошибка загрузки схемы");
    }
  }, [eventId]);

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/seats`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const map = {};
      (data.seats || []).forEach((s) => {
        map[s.seatId] = s.status;
      });
      setSeatStatus(map);
    } catch {
      // ignore
    }
  }, [eventId]);

  useEffect(() => {
    fetchLayout();
    fetchStatuses();
  }, [fetchLayout, fetchStatuses]);

  useEffect(() => {
    const timer = setInterval(fetchStatuses, 10000);
    return () => clearInterval(timer);
  }, [fetchStatuses]);

  useEffect(() => {
    const socket = new WebSocket(wsUrl(`/ws/events/${eventId}/seatmap`));
    socket.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data.toString());
        if (data.type === "seatStatusChanged" && data.seatId) {
          setSeatStatus((prev) => ({ ...prev, [data.seatId]: data.status }));
          if (data.status === "free") {
            setSelectedSeats((prev) => prev.filter((s) => s !== data.seatId));
          }
        }
      } catch {
        // ignore
      }
    };
    socket.onerror = () => console.warn("WebSocket error for seatmap");
    return () => socket.close();
  }, [eventId]);

  const toggleSeat = async (seatCode) => {
    const status = seatStatus[seatCode] ?? "unknown";
    const isSelected = selectedSeats.includes(seatCode);

    if (!isSelected && (status === "sold" || status === "reserved")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSelected) {
        await fetch(`${API_URL}/events/${eventId}/seats/unlock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current, seats: [seatCode] }),
        });
        setSelectedSeats((prev) => prev.filter((s) => s !== seatCode));
        setSeatStatus((prev) => ({ ...prev, [seatCode]: "free" }));
      } else {
        const resp = await fetch(`${API_URL}/events/${eventId}/seats/lock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current, seats: [seatCode] }),
        });
        const data = await resp.json();
        if (data?.locked?.includes(seatCode)) {
          setSelectedSeats((prev) => [...prev, seatCode]);
          setSeatStatus((prev) => ({ ...prev, [seatCode]: "selected" }));
        } else if (data?.failed?.length) {
          setError(data.failed[0]?.reason || "Не удалось забронировать место");
        }
      }
    } catch (err) {
      setError(err?.message || "Ошибка при смене статуса места");
    } finally {
      setLoading(false);
    }
  };

  const onWheel = (event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    setView((prev) => {
      const nextScale = Math.min(4, Math.max(0.5, prev.scale + delta));
      return { ...prev, scale: nextScale };
    });
  };

  const onMouseDown = (event) => {
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      x: view.x,
      y: view.y,
    };
  };

  const onMouseMove = (event) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setView((prev) => ({ ...prev, x: dragRef.current.x + dx, y: dragRef.current.y + dy }));
  };

  const stopPan = () => {
    dragRef.current.active = false;
  };

  if (!layout) {
    return <div style={{ padding: "12px 0" }}>{error || "Загрузка схемы..."}</div>;
  }

  const levelOptions = layout.levels || [];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <strong>{layout.vesselName}</strong>
        <select
          value={levelIndex}
          onChange={(e) => setLevelIndex(Number(e.target.value))}
          style={{ background: "#0f172a", color: "#e5e7eb", border: "1px solid #1f2937", padding: "6px 10px" }}
        >
          {levelOptions.map((level, idx) => (
            <option key={level.id} value={idx}>
              {level.name}
            </option>
          ))}
        </select>
        <button
          onClick={fetchStatuses}
          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #1f2937", background: "#111827", color: "#e5e7eb" }}
        >
          Обновить статусы
        </button>
        {loading && <span style={{ color: "#93c5fd" }}>Обновление...</span>}
        {error && <span style={{ color: "#f87171" }}>{error}</span>}
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Legend color="#22c55e" label="Свободно" />
        <Legend color="#d97706" label="Бронь" />
        <Legend color="#b91c1c" label="Продано" />
        <Legend color="#0ea5e9" label="Ваш выбор" />
      </div>

      <div
        style={{ width: "100%", height: "70vh", border: "1px solid #1f2937", background: "#020617", overflow: "hidden", borderRadius: 12 }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
      >
        {currentLevel ? (
          <svg width="100%" height="100%" viewBox="0 0 1200 800" style={{ background: "#02121d" }}>
            <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
              {currentLevel.backgroundSvg && (
                <image
                  href={currentLevel.backgroundSvg}
                  width="1200"
                  height="800"
                  preserveAspectRatio="xMidYMid meet"
                />
              )}

              {(currentLevel.areas || []).map((area) => (
                <g key={area.id}>
                  {(area.seats || []).map((seat) => {
                    const status = seatStatus[seat.seatCode] ?? "unknown";
                    const isSelected = selectedSeats.includes(seat.seatCode);
                    const color = statusColor(status, isSelected);
                    const cx = Number(seat.x ?? 0);
                    const cy = Number(seat.y ?? 0);
                    return (
                      <g key={seat.seatCode} onClick={() => toggleSeat(seat.seatCode)} style={{ cursor: "pointer" }}>
                        <circle cx={cx} cy={cy} r={12} fill={color} stroke="#111827" strokeWidth={2} />
                        <text
                          x={cx}
                          y={cy + 4}
                          textAnchor="middle"
                          fontSize={10}
                          fill="#e5e7eb"
                          pointerEvents="none"
                        >
                          {seat.alias || seat.seatCode}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}
            </g>
          </svg>
        ) : (
          <div style={{ padding: 12, color: "#e5e7eb" }}>Палуба не найдена</div>
        )}
      </div>

      <div style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 12, background: "#0b1220" }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Выбранные места</div>
        {selectedSeats.length === 0 ? (
          <div style={{ color: "#9ca3af" }}>Пока ничего не выбрано</div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {selectedSeats.map((seat) => (
              <span
                key={seat}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  background: "#0ea5e9",
                  color: "#022c3a",
                  fontWeight: 700,
                }}
              >
                {seat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#e5e7eb" }}>
      <span style={{ width: 14, height: 14, borderRadius: 999, background: color, display: "inline-block" }} />
      <span style={{ fontSize: 13 }}>{label}</span>
    </span>
  );
}
