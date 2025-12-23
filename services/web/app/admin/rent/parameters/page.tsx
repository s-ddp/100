"use client";

import { useMemo, useState } from "react";
import styles from "./parameters.module.css";

type ParameterType = "text" | "number" | "enum" | "multiselect";

type Parameter = {
  id: string;
  name: string;
  type: ParameterType;
  useInCard: boolean;
  useInFilter: boolean;
  status: "active" | "inactive";
  values?: string;
};

type FormState = {
  name: string;
  type: ParameterType;
  useInCard: boolean;
  useInFilter: boolean;
  status: "active" | "inactive";
  values: string;
};

const initialForm: FormState = {
  name: "",
  type: "text",
  useInCard: true,
  useInFilter: false,
  status: "active",
  values: "",
};

export default function AdminRentParameters() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const usageLabel = (p: Parameter) => {
    const usage: string[] = [];
    if (p.useInCard) usage.push("карточка");
    if (p.useInFilter) usage.push("фильтр");
    return usage.join(", ") || "—";
  };

  const openForCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openForEdit = (p: Parameter) => {
    setForm({
      name: p.name,
      type: p.type,
      useInCard: p.useInCard,
      useInFilter: p.useInFilter,
      status: p.status,
      values: p.values || "",
    });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Parameter = {
      id: editingId ?? crypto.randomUUID(),
      name: form.name.trim(),
      type: form.type,
      useInCard: form.useInCard,
      useInFilter: form.useInFilter,
      status: form.status,
      values:
        form.type === "enum" || form.type === "multiselect"
          ? form.values.trim()
          : "",
    };

    if (!payload.name) return;

    setParameters((prev) => {
      if (editingId) {
        return prev.map((p) => (p.id === editingId ? payload : p));
      }
      return [...prev, payload];
    });

    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleDelete = (id: string) => {
    setParameters((prev) => prev.filter((p) => p.id !== id));
  };

  const showValuesField = useMemo(
    () => form.type === "enum" || form.type === "multiselect",
    [form.type]
  );

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1>Параметры судов</h1>
          <p>Настройка характеристик для аренды судов.</p>
        </div>
        <button className={styles.primaryButton} onClick={openForCreate}>
          Добавить параметр
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название параметра</th>
              <th>Тип</th>
              <th>Использование</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {parameters.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  Пока нет параметров. Добавьте первый, чтобы начать.
                </td>
              </tr>
            )}
            {parameters.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.type}</td>
                <td>{usageLabel(p)}</td>
                <td className={p.status === "active" ? styles.statusActive : styles.statusInactive}>
                  {p.status === "active" ? "активен" : "выключен"}
                </td>
                <td className={styles.actions}>
                  <button onClick={() => openForEdit(p)}>Редактировать</button>
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
              <h2>{editingId ? "Редактирование параметра" : "Добавить параметр"}</h2>
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
                      type: e.target.value as ParameterType,
                    })
                  }
                >
                  <option value="text">text</option>
                  <option value="number">number</option>
                  <option value="enum">enum</option>
                  <option value="multiselect">multiselect</option>
                </select>
              </label>

              <div className={styles.row}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.useInCard}
                    onChange={(e) =>
                      setForm({ ...form, useInCard: e.target.checked })
                    }
                  />
                  Использовать в карточке
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.useInFilter}
                    onChange={(e) =>
                      setForm({ ...form, useInFilter: e.target.checked })
                    }
                  />
                  Использовать в фильтре
                </label>
              </div>

              {showValuesField && (
                <label>
                  Значения (через запятую)
                  <textarea
                    value={form.values}
                    onChange={(e) =>
                      setForm({ ...form, values: e.target.value })
                    }
                  />
                </label>
              )}

              <label>
                Статус
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
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
