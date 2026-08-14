import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { Button, EmptyState, TextField } from "../components/Bits";
import { listWatchlist, addWatchlist, removeWatchlist } from "../api/client";

const money = (n) =>
  n == null
    ? "—"
    : Number(n).toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function Watchlist() {
  const [items, setItems] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await listWatchlist();
      setItems(res.data.content ?? res.data);
    } catch {
      setError("Could not load your watchlist.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (id) => {
    await removeWatchlist(id);
    load();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="ledger-num text-[11px] text-ink-faint mb-1">No. 04 &mdash; Watchlist</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Watchlist</h1>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Watch symbol</Button>
      </div>

      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      {items === null ? (
        <p className="text-ink-soft text-sm">Loading&hellip;</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing on watch"
          hint="Add a symbol to track its live price without holding it."
          action={<Button onClick={() => setShowAdd(true)}>+ Watch symbol</Button>}
        />
      ) : (
        <div className="stub-card rounded-sm overflow-x-auto">
          <table className="ledger-table w-full text-sm">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Current price</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td className="font-display font-medium">{w.symbol}</td>
                  <td className="ledger-num">{money(w.currentPrice)}</td>
                  <td className="text-ink-soft">{w.notes || "—"}</td>
                  <td>
                    <button
                      onClick={() => handleRemove(w.id)}
                      className="field-label text-ink-faint hover:text-loss"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </Layout>
  );
}

function AddModal({ onClose, onCreated }) {
  const [symbol, setSymbol] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addWatchlist({ symbol: symbol.toUpperCase(), notes });
      onCreated();
    } catch {
      setError("Could not add this symbol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Watch a symbol" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField
          label="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="TSLA"
          required
        />
        <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        {error && <p className="text-loss text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
