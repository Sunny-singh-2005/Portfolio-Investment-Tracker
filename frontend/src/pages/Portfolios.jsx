import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { Button, EmptyState, TextField } from "../components/Bits";
import { listPortfolios, createPortfolio, deletePortfolio } from "../api/client";

export default function Portfolios() {
  const [portfolios, setPortfolios] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await listPortfolios();
      setPortfolios(res.data.content ?? res.data);
    } catch {
      setError("Could not load portfolios.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this portfolio? All transactions in it will be removed too.")) return;
    await deletePortfolio(id);
    load();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="ledger-num text-[11px] text-ink-faint mb-1">No. 02 &mdash; Register</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Portfolios</h1>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New portfolio</Button>
      </div>

      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      {portfolios === null ? (
        <p className="text-ink-soft text-sm">Loading&hellip;</p>
      ) : portfolios.length === 0 ? (
        <EmptyState
          title="No portfolios yet"
          hint="Open your first portfolio to start recording buys and sells."
          action={<Button onClick={() => setShowCreate(true)}>+ New portfolio</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolios.map((p) => (
            <Link
              key={p.id}
              to={`/portfolios/${p.id}`}
              className="stub-card rounded-sm px-6 py-5 hover:border-accent transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-semibold text-ink group-hover:text-accent transition-colors">
                  {p.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(p.id);
                  }}
                  className="text-ink-faint hover:text-loss text-xs field-label"
                >
                  Delete
                </button>
              </div>
              <p className="text-ink-soft text-sm">{p.description || "No description"}</p>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </Layout>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createPortfolio({ name, description });
      onCreated();
    } catch {
      setError("Could not create the portfolio. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="New portfolio" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="text-loss text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
