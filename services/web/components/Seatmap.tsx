'use client';

import { useEffect, useState } from 'react';

type SeatStatus = 'available' | 'locked' | 'booked';

interface Seat {
  id: number;
  label: string;
  row?: string | null;
  section?: string | null;
  priceZone?: string | null;
  basePrice?: number | null;
  status: SeatStatus;
}

interface SeatmapResponse {
  eventId: number;
  seatMapId: number;
  schemaJson: any;
  seats: Seat[];
}

interface SeatmapProps {
  eventId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function Seatmap({ eventId }: SeatmapProps) {
  const [data, setData] = useState<SeatmapResponse | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/api/events/${eventId}/seatmap`);
        if (!res.ok) throw new Error('Не удалось загрузить схему');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err?.message || 'Ошибка загрузки схемы');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId]);

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'available') return;

    setSelectedSeats((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id],
    );
  };

  const refreshSeatmap = async () => {
    const res = await fetch(`${API_URL}/api/events/${eventId}/seatmap`);
    const json = await res.json();
    setData(json);
  };

  const lockSeats = async () => {
    if (!selectedSeats.length) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/seat-lock/acquire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': 'demo-session',
        },
        body: JSON.stringify({ seatIds: selectedSeats, ttlMinutes: 10 }),
      });

      const json = await res.json();
      if (!res.ok) {
        const conflict = Array.isArray(json.conflictSeatIds)
          ? json.conflictSeatIds.join(', ')
          : 'места заняты';
        alert(`Не удалось забронировать места: ${conflict}`);
        return;
      }

      alert('Места временно забронированы');
      setSelectedSeats([]);
      await refreshSeatmap();
    } catch (err: any) {
      setError(err?.message || 'Ошибка бронирования мест');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <div>Загрузка схемы...</div>;
  if (!data) return <div>{error || 'Схема не найдена'}</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-2">
        {data.seats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.id);
          const bg =
            seat.status === 'booked'
              ? 'bg-red-400'
              : seat.status === 'locked'
              ? 'bg-yellow-300'
              : isSelected
              ? 'bg-blue-400'
              : 'bg-green-300';

          return (
            <button
              key={seat.id}
              className={`text-xs rounded px-2 py-1 ${bg}`}
              onClick={() => toggleSeat(seat)}
              disabled={seat.status !== 'available'}
            >
              {seat.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={lockSeats}
          disabled={!selectedSeats.length || loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Забронировать выбранные места
        </button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="text-xs text-gray-500 space-y-1">
        <div>
          <span className="inline-block w-3 h-3 mr-1 bg-green-300" /> свободно
        </div>
        <div>
          <span className="inline-block w-3 h-3 mr-1 bg-yellow-300" /> временно занято (lock)
        </div>
        <div>
          <span className="inline-block w-3 h-3 mr-1 bg-red-400" /> продано
        </div>
        <div>
          <span className="inline-block w-3 h-3 mr-1 bg-blue-400" /> вы выбрали
        </div>
      </div>
    </div>
  );
}
