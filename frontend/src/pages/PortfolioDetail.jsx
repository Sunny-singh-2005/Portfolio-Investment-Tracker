import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { Button, EmptyState, SelectField, Stamp, StatBlock, TextField } from "../components/Bits";
import {
  getPortfolio,
  getPortfolioSummary,
  listTransactions,
  createTransaction,
  deleteTransaction,
  getAnalytics,
} from "../api/client";
import AnalyticsPanel from "../components/AnalyticsPanel";

const money = (n) =>
  n == null
    ? "—"
    : Number(n).toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      });

const pct = (n) => (n == null ? "—" : `${Number(n) >= 0 ? "+" : ""}${Number(n).toFixed(2)}%`);

export default function PortfolioDetail() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ symbol: "", type: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  const loadCore = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.all([getPortfolio(id), getPortfolioSummary(id)]);
      setPortfolio(pRes.data);
      setSummary(sRes.data);
    } catch {
      setError("Could not load this portfolio.");
    }
  }, [id]);

  const loadTransactions = useCallback(async () => {
    const params = {
      page,
      size: 10,
      sort: "transactionDate,desc",
      ...(filters.symbol ? { symbol: filters.symbol.toUpperCase() } : {}),
      ...(filters.type ? { type: filters.type } : {}),
    };
    const res = await listTransactions(id, params);
    const data = res.data;
    setTransactions(data.content ?? data);
    setTotalPages(data.totalPages ?? 1);
  }, [id, page, filters]);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await getAnalytics(id, { lookbackDays: 90, riskFreeRatePct: 2.0 });
      setAnalytics(res.data);
    } catch {
      setAnalytics(null);
    }
  }, [id]);

  useEffect(() => {
    loadCore();
    loadAnalytics();
  }, [loadCore, loadAnalytics]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDeleteTx = async (txId) => {
    if (!confirm("Delete this transaction?")) return;
    await deleteTransaction(id, txId);
    loadTransactions();
    loadCore();
    loadAnalytics();
  };

  const holdings = summary?.holdings ?? [];

  return (
    <Layout>
      <Link to="/" className="field-label text-ink-soft hover:text-ink">
        &larr; Portfolios
      </Link>

      <div className="flex items-start justify-between mt-3 mb-8">
        <div>
          <p className="ledger-num text-[11px] text-ink-faint mb-1">No. 03 &mdash; Statement</p>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {portfolio?.name ?? "Loading\u2026"}
          </h1>
          {portfolio?.description && (
            <p className="text-ink-soft text-sm mt-1">{portfolio.description}</p>
          )}
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Record transaction</Button>
      </div>

      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      {/* Summary strip */}
      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        <StatBlock label="Market value" value={money(summary?.totalMarketValue)} />
        <StatBlock
          label="Unrealized P/L"
          value={money(summary?.totalPL ?? summary?.totalUnrealizedPL)}
          sub={pct(summary?.totalPLPercent ?? summary?.totalUnrealizedPLPercent)}
          tone={(summary?.totalPL ?? summary?.totalUnrealizedPL) >= 0 ? "gain" : "loss"}
        />
        <StatBlock label="Cost basis" value={money(summary?.totalCostBasis)} />
      </div>

      {/* Holdings */}
      <section className="mb-10">
        <h2 className="font-display text-sm font-semibold text-ink mb-3">Holdings</h2>
        {holdings.length === 0 ? (
          <EmptyState title="No holdings yet" hint="Record a BUY transaction to see it appear here." />
        ) : (
          <div className="stub-card rounded-sm overflow-x-auto">
            <table className="ledger-table w-full text-sm">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Qty</th>
                  <th>Avg. cost</th>
                  <th>Current price</th>
                  <th>Market value</th>
                  <th>Unrealized P/L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.symbol}>
                    <td className="font-display font-medium">{h.symbol}</td>
                    <td className="ledger-num">{h.quantity}</td>
                    <td className="ledger-num">{money(h.avgCost ?? h.averageCost)}</td>
                    <td className="ledger-num">{money(h.currentPrice)}</td>
                    <td className="ledger-num">{money(h.marketValue)}</td>
                    <td className="ledger-num">
                      <Stamp tone={(h.unrealizedPL ?? 0) >= 0 ? "gain" : "loss"}>
                        {pct(h.unrealizedPLPercent)}
                      </Stamp>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Analytics */}
      <AnalyticsPanel analytics={analytics} />

      {/* Transactions */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
          <h2 className="font-display text-sm font-semibold text-ink">Transaction history</h2>
          <div className="flex items-end gap-3">
            <TextField
              label="Symbol"
              value={filters.symbol}
              onChange={(e) => {
                setPage(0);
                setFilters((f) => ({ ...f, symbol: e.target.value }));
              }}
              placeholder="AAPL"
            />
            <SelectField
              label="Type"
              value={filters.type}
              onChange={(e) => {
                setPage(0);
                setFilters((f) => ({ ...f, type: e.target.value }));
              }}
            >
              <option value="">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </SelectField>
          </div>
        </div>

        {transactions === null ? (
          <p className="text-ink-soft text-sm">Loading&hellip;</p>
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions found" hint="Adjust the filters or record a new transaction." />
        ) : (
          <>
            <div className="stub-card rounded-sm overflow-x-auto">
              <table className="ledger-table w-full text-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="ledger-num text-ink-soft">{t.transactionDate}</td>
                      <td className="font-display font-medium">{t.symbol}</td>
                      <td>
                        <Stamp tone={t.type === "BUY" ? "gain" : "loss"}>{t.type}</Stamp>
                      </td>
                      <td className="ledger-num">{t.quantity}</td>
                      <td className="ledger-num">{money(t.price)}</td>
                      <td className="ledger-num">{money(t.quantity * t.price)}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteTx(t.id)}
                          className="field-label text-ink-faint hover:text-loss"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p) => p - 1)}
                className="field-label text-ink-soft disabled:opacity-30 hover:text-ink"
              >
                &larr; Previous
              </button>
              <span className="ledger-num text-xs text-ink-faint">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="field-label text-ink-soft disabled:opacity-30 hover:text-ink"
              >
                Next &rarr;
              </button>
            </div>
          </>
        )}
      </section>

      {showAdd && (
        <AddTransactionModal
          portfolioId={id}
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            loadTransactions();
            loadCore();
            loadAnalytics();
          }}
        />
      )}
    </Layout>
  );
}

function AddTransactionModal({ portfolioId, onClose, onCreated }) {
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createTransaction(portfolioId, {
        symbol: symbol.toUpperCase(),
        type,
        quantity: Number(quantity),
        price: Number(price),
        transactionDate,
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Could not record the transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Record transaction" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField
          label="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="AAPL"
          required
        />
        <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </SelectField>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Quantity"
            type="number"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <TextField
            label="Price"
            type="number"
            step="any"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <TextField
          label="Date"
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          required
        />
        {error && <p className="text-loss text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
