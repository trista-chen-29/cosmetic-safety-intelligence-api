import { useState } from "react";
import { Link } from "react-router-dom";
import type { RiskLevel, SavedProduct } from "../types/api";
import { formatAnalyzedAt, formatDate, productTypeLabel, riskHeadline } from "../utils/format";
import { deleteSavedProduct, loadSavedProducts, mostRelevantExpiration } from "../utils/storage";

const riskTone: Record<RiskLevel, string> = {
  low: "bg-sage-soft text-sage-dark",
  medium: "bg-amber-soft text-amber",
  high: "bg-terra-soft text-terra",
};

export function SavedPage() {
  const [products, setProducts] = useState<SavedProduct[]>(() => loadSavedProducts());

  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-3xl font-semibold tracking-tight">Saved products</h1>
        <p className="mt-3 text-base leading-7 text-muted">
          Products you save stay on this phone only. Nothing has been saved yet.
        </p>
        <Link
          to="/scan"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-sage px-4 text-base font-semibold text-white"
        >
          Check a product
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Saved products</h1>
      <ul className="space-y-3">
        {products.map((product) => {
          const expiration = mostRelevantExpiration(product.result);
          return (
            <li key={product.id} className="rounded-3xl bg-white p-4 ring-1 ring-ink/10">
              <Link to={`/saved/${product.id}`} className="block">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{product.input.product_name}</p>
                    <p className="mt-1 capitalize text-sm text-muted">
                      {productTypeLabel(product.input.product_type)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${riskTone[product.result.risk_level]}`}
                  >
                    {product.result.risk_level} · {riskHeadline(product.result.risk_level)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  Estimated expiration: {formatDate(expiration)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Analyzed {formatAnalyzedAt(product.createdAt)}
                </p>
              </Link>
              <button
                type="button"
                className="mt-3 min-h-11 text-sm font-semibold text-terra"
                onClick={() => setProducts(deleteSavedProduct(product.id))}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
