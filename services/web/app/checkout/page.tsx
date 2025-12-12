'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CustomerPayload {
  name: string;
  phone: string;
  email: string;
}

export default function CheckoutPage() {
  const [eventId, setEventId] = useState(1);
  const [seats, setSeats] = useState('');
  const [customer, setCustomer] = useState<CustomerPayload>({
    name: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const seatList = seats
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!seatList.length) {
      setError('Укажите хотя бы одно место через запятую');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          seats: seatList,
          customer,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Не удалось создать заказ');
        return;
      }

      if (json?.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        setError('Ссылка на оплату не получена');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Ошибка при создании заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Оформление заказа</h1>
        <p className="text-sm text-gray-600">Введите данные и перейдите к оплате</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">ID события</label>
        <input
          type="number"
          value={eventId}
          onChange={(e) => setEventId(Number(e.target.value))}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Места (через запятую)</label>
        <input
          type="text"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          placeholder="например: 1, 2, 3"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Имя</label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Телефон</label>
          <input
            type="text"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? 'Создаём заказ...' : 'Перейти к оплате'}
      </button>
    </div>
  );
}
