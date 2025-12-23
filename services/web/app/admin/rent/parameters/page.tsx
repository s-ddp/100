"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./parameters.module.css";

type ParamType = "text" | "number" | "enum" | "multiselect" | "boolean";

type RentParam = {
  id: string;
  name: string;
  type: ParamType;
  useInFilters: boolean;
  active: boolean;
  options: string[];
};

type FormState = {
  id?: string;
  name: string;
  type: ParamType;
  useInFilters: boolean;
  active: boolean;
  optionsText: string;
};

const emptyForm: FormState = {
  name: "",
  type: "text",
  useInFilters: true,
  active: true,
  optionsText: "",
};

const typeLabels: Record<ParamType, string> = {
  text: "Текст",
  number: "Число",
  enum: "Список (один вариант)",
  multiselect: "Список (несколько вариантов)",
  boolean: "Да / Нет",
};

export default function AdminRentParameters() {
  const [parameters, setParameters] = useState<RentParam[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasOptions = useMemo(
    () => form.type === "enum" || form.type === "multiselect",
    [form.type]
  );

  async function load() {
    const res = await fetch("/api/admin/rent/parameters", { cache: "no-store" });
    const data = await res.json();
    setParameters(data.parameters || []);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: RentParam) {
    setForm({
      id: p.id,
      name: p.name,
      type: p.type,
      useInFilters: p.useInFilters,
      active: p.active,
      optionsText: (p.options || []).join(", "),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Partial<RentParam> = {
        id: form.id,
        name: form.name.trim(),
        type: form.type,
        useInFilters: form.useInFilters,
        active: form.active,
        options: hasOptions
          ? form.optionsText
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : [],
      };

      const res = await fetch("/api/admin/rent/parameters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.parameters) setParameters(data.parameters);
      setModalOpen(false);
      setForm(emptyForm);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить параметр?")) return;
    const res = await fetch(`/api/admin/rent/parameters?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.parameters) setParameters(data.parameters);
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1>Параметры судов</h1>
          <p>Настройка характеристик для аренды судов.</p>
        </div>
        <button className={styles.primaryButton} onClick={openCreate}>
          Добавить параметр
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название параметра</th>
              <th>Тип параметра</th>
              <th>Используется в фильтрах</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {parameters.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  Пока нет параметров. Добавьте первый.
                </td>
              </tr>
            )}
            {parameters.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{typeLabels[p.type]}</td>
                <td>{p.useInFilters ? "да" : "нет"}</td>
                <td className={p.active ? styles.statusActive : styles.statusInactive}>
                  {p.active ? "активен" : "выключен"}
                </td>
                <td className={styles.actions}>
                  <button onClick={() => openEdit(p)}>Редактировать</button>
                  <button onClick={() => handleDelete(p.id)} className={styles.danger}>
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
              <h2>{form.id ? "Редактирование параметра" : "Добавить параметр"}</h2>
              <button className={styles.close} onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label>
                Название параметра
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>

              <label>
                Тип параметра
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as ParamType,
                    })
                  }
                >
                  <option value="text">Текст</option>
                  <option value="number">Число</option>
                  <option value="enum">Список (один вариант)</option>
                  <option value="multiselect">Список (несколько вариантов)</option>
                  <option value="boolean">Да / Нет</option>
                </select>
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.useInFilters}
                  onChange={(e) => setForm({ ...form, useInFilters: e.target.checked })}
                />
                Использовать в фильтрах
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Активен
              </label>

              {hasOptions && (
                <label>
                  Значения (через запятую)
                  <textarea
                    value={form.optionsText}
                    onChange={(e) =>
                      setForm({ ...form, optionsText: e.target.value })
                    }
                  />
                </label>
              )}

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.primaryButton} disabled={loading}>
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
