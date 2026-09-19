import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Disclaimer } from "../components/Disclaimer";
import { RiskBadge } from "../components/RiskBadge";
import { confidenceLabel, formatDate } from "../utils/format";
import { deleteSavedProduct, getSavedProduct } from "../utils/storage";

export function SavedDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product] = useState(() => (id ? getSavedProduct(id) : undefined));

  if (!product) {
    return <Navigate to="/saved" replace />;
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <p className="text-sm font-medium text-muted">Saved on this device</p>
      <h1 className="text-3xl font-semibold tracking-tight">{product.input.product_name}</h1>
      <RiskBadge level={product.result.risk_level} />
      <p className="text-base leading-7">{product.result.recommended_action}</p>
      <div className="grid gap-3">
        <div className="rounded-3xl bg-white px-5 py-4 ring-1 ring-ink/10">
          <p className="text-sm text-muted">Estimated opened expiration</p>
          <p className="mt-1 text-lg font-semibold">
            {formatDate(product.result.opened_estimated_expiration_date)}
          </p>
        </div>
        <div className="rounded-3xl bg-white px-5 py-4 ring-1 ring-ink/10">
          <p className="text-sm text-muted">Estimated unopened expiration</p>
          <p className="mt-1 text-lg font-semibold">
            {formatDate(product.result.unopened_estimated_expiration_date)}
          </p>
        </div>
      </div>
      <p className="text-sm leading-6 text-muted">{confidenceLabel(product.result.confidence_score)}</p>
      {product.photoPreview ? (
        <img
          src={product.photoPreview}
          alt={`Photo of ${product.input.product_name}`}
          className="h-48 w-full rounded-3xl object-cover"
        />
      ) : null}
      <Disclaimer />
      <div className="mt-auto flex flex-col gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            deleteSavedProduct(product.id);
            navigate("/saved");
          }}
        >
          Delete this product
        </Button>
        <Link to="/saved" className="py-3 text-center text-sm font-medium text-sage">
          Back to saved products
        </Link>
      </div>
    </div>
  );
}
