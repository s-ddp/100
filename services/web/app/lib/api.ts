export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// dictionaries
export const apiGetBoatTypes = () => request<{ items: any[] }>("/admin/rent/dictionaries/boat-types");
export const apiGetLocations = () => request<{ items: any[] }>("/admin/rent/dictionaries/locations");
export const apiGetParameters = () => request<{ items: any[] }>("/admin/rent/dictionaries/parameters");

// admin boats
export const apiAdminGetBoats = (qs: string = "") => request<{ items: any[] }>(`/admin/rent/boats${qs}`);
export const apiAdminCreateBoat = (payload: any) =>
  request<{ item: any }>("/admin/rent/boats", { method: "POST", body: JSON.stringify(payload) });
export const apiAdminGetBoat = (id: string) => request<{ item: any }>(`/admin/rent/boats/${id}`);
export const apiAdminUpdateBoat = (id: string, payload: any) =>
  request<{ item: any }>(`/admin/rent/boats/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const apiAdminToggleBoatActive = (id: string, isActive: boolean) =>
  request<{ item: any }>(`/admin/rent/boats/${id}/active`, { method: "PATCH", body: JSON.stringify({ isActive }) });

// public
export const apiPublicGetBoats = (qs: string = "") => request<{ items: any[] }>(`/rent/boats${qs}`);
export const apiPublicGetBoat = (id: string) => request<{ item: any }>(`/rent/boats/${id}`);
