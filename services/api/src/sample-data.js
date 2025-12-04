export const sampleSuppliers = [
  {
    id: 'astra-marin',
    name: 'Astra Marin',
    contactEmail: 'sales@astramarin.example',
  },
  {
    id: 'neva-travel',
    name: 'Neva Travel',
    contactEmail: 'ops@nevatravel.example',
  },
];

export const sampleCatalog = [
  {
    id: 'exc-001',
    supplierId: 'astra-marin',
    title: 'Ночная экскурсия по Неве',
    type: 'excursion',
    departurePort: 'Дворцовая набережная',
    departureTime: '2035-07-01T20:00:00+03:00',
    durationMinutes: 90,
    language: ['ru', 'en'],
    currency: 'RUB',
    fares: [
      { code: 'adult', name: 'Взрослый', price: 2500, vat: '20%' },
      { code: 'child', name: 'Детский', price: 1500, vat: '10%' },
    ],
    seating: {
      mode: 'seat-map',
      deck: 'main',
      capacity: 120,
      sections: [
        { id: 'a', name: 'Нос', capacity: 40 },
        { id: 'b', name: 'Центр', capacity: 50 },
        { id: 'c', name: 'Корма', capacity: 30 },
      ],
    },
  },
  {
    id: 'rent-boat-01',
    supplierId: 'neva-travel',
    title: 'Аренда катера (2 часа)',
    type: 'rental',
    departurePort: 'Английская набережная',
    durationMinutes: 120,
    language: ['ru'],
    currency: 'RUB',
    fares: [
      { code: 'base', name: 'Базовый пакет', price: 18000, vat: '20%' },
    ],
    seating: {
      mode: 'general-admission',
      capacity: 10,
    },
  },
  {
    id: 'event-boat-party',
    supplierId: 'astra-marin',
    title: 'Вечеринка на борту (пятница)',
    type: 'event',
    departurePort: 'Речной вокзал',
    departureTime: '2035-07-05T22:00:00+03:00',
    durationMinutes: 180,
    language: ['ru', 'en', 'zh'],
    currency: 'RUB',
    fares: [
      { code: 'standard', name: 'Стандарт', price: 3200, vat: '20%' },
      { code: 'vip', name: 'VIP', price: 5200, vat: '20%' },
    ],
    seating: {
      mode: 'seat-map',
      deck: 'upper',
      capacity: 80,
      sections: [
        { id: 'vip', name: 'VIP-зона', capacity: 20 },
        { id: 'std', name: 'Общий зал', capacity: 60 },
      ],
    },
  },
];
