"use client";

import { useState } from "react";
import styles from "./cities.module.css";

type City = {
  id: string;
  name: string;
  active: boolean;
};

const emptyCity: Omit<City, "id"> = { name: "", active: true };

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyCity);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(emptyCity);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (city: City) => {
    setForm({ name: city.name, active: city.active });
    setEditingId(city.id);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const payload: City = {
      id: editingId ?? crypto.randomUUID(),
      name,
      active: form.active,
    };

    setCities((prev) => {
      if (editingId) {
        return prev.map((c) => (c.id === editingId ? payload : c));
      }
      return [...prev, payload];
    });

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyCity);
  };

  const handleDelete = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1>Города</h1>
          <p>Справочник городов для аренды и экскурсий.</p>
        </div>
        <button className={styles.primaryButton} onClick={openCreate}>
          Добавить город
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название города</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {cities.length === 0 && (
              <tr>
                <td colSpan={3} className={styles.empty}>
                  Пока нет городов. Добавьте первый город.
                </td>
              </tr>
            )}
            {cities.map((city) => (
              <tr key={city.id}>
                <td>{city.name}</td>
                <td className={city.active ? styles.statusActive : styles.statusInactive}>
                  {city.active ? "активен" : "выключен"}
                </td>
                <td className={styles.actions}>
                  <button onClick={() => openEdit(city)}>Редактировать</button>
                  <button onClick={() => handleDelete(city.id)} className={styles.danger}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div
            className={styles.modal}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Редактирование города" : "Добавить город"}</h2>
              <button className={styles.close} onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label>
                Название города
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Активен
              </label>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
