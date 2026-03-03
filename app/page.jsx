"use client";

import { useMemo, useState } from "react";
import rates from "../data/rates.json";

function money(n) {
  if (!Number.isFinite(n)) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function Page() {
  const [qty, setQty] = useState(() => ({}));
  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    for (const c of rates.categories) initial[c.id] = (c.name.toLowerCase().includes("individual") || c.name.toLowerCase().includes("entities"));
    return initial;
  });
  const [surcharges, setSurcharges] = useState(() => ({
    cc: false,
    amended: false,
    adjust: false,
  }));

  const flatItems = useMemo(() => {
    const items = [];
    for (const cat of rates.categories) {
      for (const group of cat.groups) {
        for (const item of group.items) {
          items.push({ ...item, catId: cat.id, catName: cat.name, groupName: group.name });
        }
      }
    }
    return items;
  }, []);

  const subtotal = useMemo(() => {
    let sum = 0;
    for (const item of flatItems) {
      const q = Number(qty[item.id] ?? 0);
      if (!Number.isFinite(q) || q <= 0) continue;
      sum += item.price * q;
    }
    return sum;
  }, [qty, flatItems]);

  const surchargeTotal = useMemo(() => {
    let extra = 0;
    for (const s of rates.surcharges) {
      if (surcharges[s.id]) extra += subtotal * s.rate;
    }
    return extra;
  }, [subtotal, surcharges]);

  const total = subtotal + surchargeTotal;

  function setItemQty(itemId, v) {
    const n = v === "" ? "" : Number(v);
    setQty((prev) => ({ ...prev, [itemId]: n }));
  }

  function toggleOne(itemId) {
    setQty((prev) => {
      const cur = Number(prev[itemId] ?? 0);
      return { ...prev, [itemId]: cur > 0 ? 0 : 1 };
    });
  }

  function clearAll() {
    setQty({});
    setSurcharges({ cc: false, amended: false, adjust: false });
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 18px 60px" }}>
      <header style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <img
    src="/logo.png"
    alt="A to Z Tax Firm"
    style={{ height: 60, width: "auto" }}
  />
  <div>
    <h1 style={{ fontSize: 30, lineHeight: 1.1, margin: 0 }}>
      Fee Estimator
    </h1>
          <p style={{ marginTop: 10, marginBottom: 0, color: "#444", maxWidth: 720 }}>
            Add the forms/services you have and quantities (example: Schedule C = 2). This is a quick estimate, not a final quote.
          </p>
          <ul style={{ marginTop: 10, color: "#555" }}>
            {rates.notes.map((n) => (
              <li key={n} style={{ marginBottom: 4 }}>{n}</li>
            ))}
          </ul>
        </div>

        <div style={{ minWidth: 280, border: "1px solid #e5e5e5", borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#666" }}>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#666" }}>Surcharges</span>
            <strong>{money(surchargeTotal)}</strong>
          </div>
          <div style={{ height: 1, background: "#eee", margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "#111" }}>Estimated Total</span>
            <strong style={{ fontSize: 18 }}>{money(total)}</strong>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {rates.surcharges.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#333" }}>
                <input
                  type="checkbox"
                  checked={!!surcharges[s.id]}
                  onChange={(e) => setSurcharges((prev) => ({ ...prev, [s.id]: e.target.checked }))}
                />
                {s.label}
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={clearAll} style={btnSecondary}>Clear</button>
            <a href="mailto:info@atoztaxfirm.com?subject=Fee%20Estimate%20Request" style={{ ...btnPrimary, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              Email us this estimate
            </a>
          </div>

          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "#666" }}>
            Tip: click an item name to toggle 0 ↔ 1, or enter any quantity.
          </p>
        </div>
      </header>

      <section style={{ marginTop: 22 }}>
        {rates.categories.map((cat) => (
          <div key={cat.id} style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 16, overflow: "hidden" }}>
            <button
              onClick={() => setExpanded((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 14px",
                background: "#fafafa",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700 }}>{cat.name}</span>
              <span style={{ color: "#666" }}>{expanded[cat.id] ? "Hide" : "Show"}</span>
            </button>

            {expanded[cat.id] && (
              <div style={{ padding: 14, display: "grid", gap: 16 }}>
                {cat.groups.map((g) => (
                  <div key={g.name}>
                    {g.name !== "General" && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 8 }}>{g.name}</div>
                    )}

                    <div style={{ display: "grid", gap: 8 }}>
                      {g.items.map((item) => (
                        <div key={item.id} style={rowStyle}>
                          <button
                            type="button"
                            onClick={() => toggleOne(item.id)}
                            style={{ textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                            title="Toggle between 0 and 1"
                          >
                            <div style={{ fontWeight: 600 }}>{item.label}</div>
                            <div style={{ fontSize: 13, color: "#666" }}>{money(item.price)} each</div>
                          </button>

                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <label style={{ fontSize: 13, color: "#666" }}>Qty</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={qty[item.id] ?? 0}
                              onChange={(e) => setItemQty(item.id, e.target.value)}
                              style={qtyInput}
                            />
                            <div style={{ width: 110, textAlign: "right", fontWeight: 700 }}>
                              {money((Number(qty[item.id] ?? 0) || 0) * item.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <footer style={{ marginTop: 24, color: "#777", fontSize: 12 }}>
        © {new Date().getFullYear()} A to Z Tax Firm — Fee estimator
      </footer>
    </main>
  );
}

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  fontWeight: 700,
  cursor: "pointer",
};

const rowStyle = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
};

const qtyInput = {
  width: 84,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
};
