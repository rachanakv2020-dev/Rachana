const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  getCategories: async () => normalizeList(await request("/products/categories")),
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return normalizeList(await request(`/products${query ? `?${query}` : ""}`));
  },
  checkout: (payload, token) => request("/orders/checkout", { method: "POST", body: payload, token }),
  createRazorpayOrder: (payload, token) => request("/orders/razorpay-order", { method: "POST", body: payload, token }),
  verifyRazorpayPayment: (payload, token) => request("/orders/razorpay-verify", { method: "POST", body: payload, token }),
};
