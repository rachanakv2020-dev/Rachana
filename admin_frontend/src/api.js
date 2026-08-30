const BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:5000/api/admin";

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("ff_admin_token");
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Unable to complete the request.");
  return data;
}

export const api = {
  adminLogin: (payload) => request("/auth/login", { method: "POST", body: payload }),
  getProducts: () => request("/products"),
  getCategories: () => request("/products/categories"),
  getPayments: () => request("/payments"),
  getOrders: () => request("/orders"),
  uploadImage: async (file) => {
    const headers = {};
    const token = localStorage.getItem("ff_admin_token");
    if (token) headers.Authorization = `Bearer ${token}`;
    const body = new FormData();
    body.append("image", file);
    const response = await fetch(`${BASE_URL}/products/upload`, { method: "POST", headers, body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Unable to upload image.");
    return { ...data, url: data.url.startsWith("http") ? data.url : `${import.meta.env.VITE_ADMIN_UPLOADS_BASE_URL || "http://localhost:5000"}${data.url}` };
  },
  createProduct: (payload) => request("/products", { method: "POST", body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PUT", body: payload }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  setProductListed: (id, listed) => request(`/products/${id}/listed`, { method: "PATCH", body: { listed } }),
};