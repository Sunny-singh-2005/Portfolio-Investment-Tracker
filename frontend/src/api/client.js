import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ledger_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ledger_token");
      localStorage.removeItem("ledger_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const register = (payload) => client.post("/auth/register", payload);
export const login = (payload) => client.post("/auth/login", payload);

// ---- Portfolios ----
export const listPortfolios = () => client.get("/portfolios");
export const getPortfolio = (id) => client.get(`/portfolios/${id}`);
export const createPortfolio = (payload) => client.post("/portfolios", payload);
export const updatePortfolio = (id, payload) => client.put(`/portfolios/${id}`, payload);
export const deletePortfolio = (id) => client.delete(`/portfolios/${id}`);
export const getPortfolioSummary = (id) => client.get(`/portfolios/${id}/summary`);

// ---- Transactions ----
export const listTransactions = (portfolioId, params) =>
  client.get(`/portfolios/${portfolioId}/transactions`, { params });
export const createTransaction = (portfolioId, payload) =>
  client.post(`/portfolios/${portfolioId}/transactions`, payload);
export const deleteTransaction = (portfolioId, txId) =>
  client.delete(`/portfolios/${portfolioId}/transactions/${txId}`);

// ---- Analytics ----
export const getAnalytics = (portfolioId, params) =>
  client.get(`/portfolios/${portfolioId}/analytics`, { params });

// ---- Watchlist ----
export const listWatchlist = () => client.get("/watchlist");
export const addWatchlist = (payload) => client.post("/watchlist", payload);
export const removeWatchlist = (id) => client.delete(`/watchlist/${id}`);

export default client;
