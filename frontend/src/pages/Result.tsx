import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Disclaimer } from "../components/Disclaimer";
import { RiskBadge } from "../components/RiskBadge";
import { useSession } from "../state/session";
import { confidenceLabel, formatDate } from "../utils/format";
import { saveProduct } from "../utils/storage";

export function ResultPage() {
  const navigate = useNavigate();
  const { session, setDraftPhoto, setSession } = useSession();
  const [saved, setSaved] = useState(false);

  if (!session) {
    return <Navigate to="/scan" replace />;
  }

  const { input, result, photoPreview } = session;

  function onSave() {
    saveProduct(input, result, photoPreview);
    setSaved(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-muted">Estimated result</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{input.product_name}</h1>
      </div>

      <RiskBadge level={result.risk_level} />

      <section className="rounded-3xl bg-white p-5 ring-1 ring-ink/10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">What to do</h2>
        <p className="mt-2 text-base leading-7">{result.recommended_action}</p>
      </section>

      <section className="grid grid-cols-1 gap-3">
        <DateCard
          label="Estimated opened expiration"
          value={formatDate(result.opened_estimated_expiration_date)}
        />
        <DateCard
          label="Estimated unopened expiration"
          value={formatDate(result.unopened_estimated_expiration_date)}
        />
      </section>

      <p className="text-sm leading-6 text-muted">{confidenceLabel(result.confidence_score)}</p>

      {result.reasoning_summary.length > 0 ? (
        <ul className="space-y-2 rounded-3xl bg-white p-5 text-sm leading-6 text-ink ring-1 ring-ink/10">
          {result.reasoning_summary.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {photoPreview ? (
        <img
          src={photoPreview}
          alt={`Photo of ${input.product_name}`}
          className="h-48 w-full rounded-3xl object-cover ring-1 ring-ink/10"
        />
      ) : null}

      <Disclaimer />

      <div className="mt-auto flex flex-col gap-3 pt-2">
        <Button type="button" onClick={onSave} disabled={saved}>
          {saved ? "Saved on this device" : "Save product"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setDraftPhoto(null);
            setSession(null);
            navigate("/scan");
          }}
        >
          Check another product
        </Button>
        <Link to="/saved" className="py-3 text-center text-sm font-medium text-sage">
          View saved products
        </Link>
      </div>
    </div>
  );
}

function DateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white px-5 py-4 ring-1 ring-ink/10">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
