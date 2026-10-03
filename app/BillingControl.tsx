"use client";

import { useEffect, useState, useMemo } from "react";

type BillingProduct = {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  invoice: string;
  invoiceDate: string;
  supplier: string;
};

type StoreProduct = {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  recordedDate: string;
};

type DiscrepancyType = "missing" | "price_diff" | "qty_diff";
type Discrepancy = {
  type: DiscrepancyType;
  product: BillingProduct;
  storeProduct?: StoreProduct;
  priceDifference?: number;
  qtyDifference?: number;
};

export default function BillingControl() {
  const [billingProducts, setBillingProducts] = useState<BillingProduct[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DiscrepancyType | "all">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/billing-control", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as { billing: BillingProduct[]; store: StoreProduct[] };
          setBillingProducts(data.billing);
          setStoreProducts(data.store);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const discrepancies = useMemo(() => {
    const result: Discrepancy[] = [];

    billingProducts.forEach((billingProduct) => {
      const storeProduct = storeProducts.find(
        (sp) => sp.code === billingProduct.code || sp.description.toLowerCase() === billingProduct.description.toLowerCase()
      );

      if (!storeProduct) {
        result.push({
          type: "missing",
          product: billingProduct,
        });
      } else {
        if (Math.abs(storeProduct.price - billingProduct.unitPrice) > 0.01) {
          result.push({
            type: "price_diff",
            product: billingProduct,
            storeProduct,
            priceDifference: storeProduct.price - billingProduct.unitPrice,
          });
        }
        if (storeProduct.quantity !== billingProduct.quantity) {
          result.push({
            type: "qty_diff",
            product: billingProduct,
            storeProduct,
            qtyDifference: storeProduct.quantity - billingProduct.quantity,
          });
        }
      }
    });

    return result;
  }, [billingProducts, storeProducts]);

  const filteredDiscrepancies = useMemo(() => {
    if (filter === "all") {
      if (selectedInvoice) {
        return discrepancies.filter((d) => d.product.invoice === selectedInvoice);
      }
      return discrepancies;
    }

    const filtered = discrepancies.filter((d) => d.type === filter);
    if (selectedInvoice) {
      return filtered.filter((d) => d.product.invoice === selectedInvoice);
    }
    return filtered;
  }, [discrepancies, filter, selectedInvoice]);

  const invoices = useMemo(() => {
    return [...new Set(billingProducts.map((p) => p.invoice))];
  }, [billingProducts]);

  const stats = {
    total: discrepancies.length,
    missing: discrepancies.filter((d) => d.type === "missing").length,
    priceDiff: discrepancies.filter((d) => d.type === "price_diff").length,
    qtyDiff: discrepancies.filter((d) => d.type === "qty_diff").length,
  };

  return (
    <section className="billing-control">
      <header className="topbar billing-header">
        <div>
          <p className="eyebrow">Controlo Operacional</p>
          <h1>Controlo de Faturação</h1>
          <p>Verifique a concordância entre faturas de fornecedores e registos no My Store.</p>
        </div>
      </header>

      {loading ? (
        <div className="loading-pill">A carregar dados de faturação…</div>
      ) : (
        <>
          <section className="billing-stats">
            <article className={`stat-card ${stats.missing > 0 ? "alert" : ""}`}>
              <span className="stat-icon">⚠</span>
              <div>
                <small>Produtos não registados</small>
                <strong>{stats.missing}</strong>
              </div>
            </article>
            <article className={`stat-card ${stats.priceDiff > 0 ? "alert" : ""}`}>
              <span className="stat-icon">€</span>
              <div>
                <small>Diferenças de preço</small>
                <strong>{stats.priceDiff}</strong>
              </div>
            </article>
            <article className={`stat-card ${stats.qtyDiff > 0 ? "alert" : ""}`}>
              <span className="stat-icon">📦</span>
              <div>
                <small>Diferenças de quantidade</small>
                <strong>{stats.qtyDiff}</strong>
              </div>
            </article>
            <article className="stat-card">
              <span className="stat-icon">✓</span>
              <div>
                <small>Total de discrepâncias</small>
                <strong>{stats.total}</strong>
              </div>
            </article>
          </section>

          <section className="billing-filters">
            <div className="filter-group">
              <label>Filtrar por tipo:</label>
              <div className="filter-buttons">
                <button
                  className={filter === "all" ? "active" : ""}
                  onClick={() => setFilter("all")}
                >
                  Todas ({stats.total})
                </button>
                <button
                  className={filter === "missing" ? "active" : ""}
                  onClick={() => setFilter("missing")}
                >
                  Não registados ({stats.missing})
                </button>
                <button
                  className={filter === "price_diff" ? "active" : ""}
                  onClick={() => setFilter("price_diff")}
                >
                  Preço ({stats.priceDiff})
                </button>
                <button
                  className={filter === "qty_diff" ? "active" : ""}
                  onClick={() => setFilter("qty_diff")}
                >
                  Quantidade ({stats.qtyDiff})
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Filtrar por fatura:</label>
              <select
                className="invoice-select"
                value={selectedInvoice || ""}
                onChange={(e) => setSelectedInvoice(e.target.value || null)}
              >
                <option value="">Todas as faturas</option>
                {invoices.map((invoice) => (
                  <option key={invoice} value={invoice}>
                    {invoice}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {filteredDiscrepancies.length === 0 ? (
            <section className="empty-state">
              <p className="eyebrow">Nenhuma discrepância encontrada</p>
              <h2>Todos os registos estão corretos</h2>
            </section>
          ) : (
            <section className="billing-table-wrap">
              <table className="discrepancies-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Código</th>
                    <th>Descrição do Produto</th>
                    <th>Fatura</th>
                    <th>Data</th>
                    <th>Fornecedor</th>
                    <th>Quantidade</th>
                    <th>Preço Unit.</th>
                    <th>Detalhes da Discrepância</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiscrepancies.map((discrepancy, index) => (
                    <tr key={index} className={`row-${discrepancy.type}`}>
                      <td>
                        <span className={`badge badge-${discrepancy.type}`}>
                          {discrepancy.type === "missing" && "Não registado"}
                          {discrepancy.type === "price_diff" && "Preço diferente"}
                          {discrepancy.type === "qty_diff" && "Qtd diferente"}
                        </span>
                      </td>
                      <td className="code">{discrepancy.product.code}</td>
                      <td>{discrepancy.product.description}</td>
                      <td className="invoice">{discrepancy.product.invoice}</td>
                      <td>{new Intl.DateTimeFormat("pt-PT").format(new Date(discrepancy.product.invoiceDate))}</td>
                      <td>{discrepancy.product.supplier}</td>
                      <td>
                        {discrepancy.product.quantity} {discrepancy.product.unit}
                        {discrepancy.storeProduct && discrepancy.type === "qty_diff" && (
                          <span className="comparison">
                            (Registado: {discrepancy.storeProduct.quantity})
                          </span>
                        )}
                      </td>
                      <td>€{discrepancy.product.unitPrice.toFixed(2)}</td>
                      <td>
                        {discrepancy.type === "missing" && (
                          <span className="detail">Produto não encontrado no My Store</span>
                        )}
                        {discrepancy.type === "price_diff" && (
                          <span className="detail">
                            Registado: €{discrepancy.storeProduct?.price.toFixed(2)}
                            ({discrepancy.priceDifference! > 0 ? "+" : ""}{discrepancy.priceDifference?.toFixed(2)})
                          </span>
                        )}
                        {discrepancy.type === "qty_diff" && (
                          <span className="detail">
                            Diferença: {discrepancy.qtyDifference! > 0 ? "+" : ""}{discrepancy.qtyDifference}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}

      <footer>
        <span>Controlo de Faturação · Sincronização com Google Drive</span>
        <span>Última atualização: {new Date().toLocaleString("pt-PT")}</span>
      </footer>
    </section>
  );
}
