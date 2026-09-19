import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Field, SelectInput, TextInput } from "../components/Field";
import { AnalyzeApiError, analyzeProduct } from "../services/analyze";
import { useSession } from "../state/session";
import { PRODUCT_TYPES } from "../types/api";
import { fileToPhoto } from "../utils/photo";
import {
  buildAnalyzeRequest,
  emptyProductForm,
  validateProductForm,
  type ProductFormValue,
} from "../utils/validation";

export function ScanPage() {
  const navigate = useNavigate();
  const cameraInput = useRef<HTMLInputElement>(null);
  const { draftPhoto, setDraftPhoto, setSession } = useSession();
  const [form, setForm] = useState<ProductFormValue>(emptyProductForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showStorage, setShowStorage] = useState(false);

  function update<K extends keyof ProductFormValue>(key: K, value: ProductFormValue[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      setDraftPhoto(await fileToPhoto(file));
    } catch {
      setFormError("Could not read that photo. Try another one.");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateProductForm(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    if (!navigator.onLine) {
      setFormError("You appear to be offline. Analysis needs a network connection.");
      return;
    }

    setBusy(true);
    try {
      const input = buildAnalyzeRequest(form, draftPhoto?.photoBase64 ?? null);
      const result = await analyzeProduct(input);
      setSession({
        input,
        result,
        photoPreview: draftPhoto?.previewUrl ?? null,
      });
      navigate("/result");
    } catch (error) {
      const message =
        error instanceof AnalyzeApiError
          ? error.message
          : "Something went wrong. Try again.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-1 flex-col gap-5" onSubmit={(event) => void onSubmit(event)}>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Check a product</h1>
        <p className="mt-2 text-base leading-7 text-muted">
          A photo helps you remember it later. The estimate still needs the details below.
        </p>
      </div>

      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          void onPhoto(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />

      {draftPhoto ? (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink/10">
          <img src={draftPhoto.previewUrl} alt="Selected product" className="h-56 w-full object-cover" />
          <div className="grid grid-cols-2 gap-2 p-3">
            <button
              type="button"
              className="min-h-11 rounded-xl text-sm font-semibold text-sage"
              onClick={() => cameraInput.current?.click()}
            >
              Retake
            </button>
            <button
              type="button"
              className="min-h-11 rounded-xl text-sm font-semibold text-terra"
              onClick={() => setDraftPhoto(null)}
            >
              Remove photo
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => cameraInput.current?.click()}
          className="flex min-h-36 flex-col items-center justify-center rounded-3xl border border-dashed border-sage/40 bg-sage-soft/50 text-sage"
        >
          <span className="text-base font-semibold">Take a product photo</span>
          <span className="mt-1 text-sm text-sage/80">Optional, but helpful</span>
        </button>
      )}

      <Field label="Product name" required error={errors.productName} hint='Example: “Maybelline Great Lash”'>
        <TextInput
          value={form.productName}
          autoComplete="off"
          onChange={(event) => update("productName", event.target.value)}
        />
      </Field>

      <Field label="Product type" required error={errors.productType}>
        <SelectInput
          value={form.productType}
          onChange={(event) => update("productType", event.target.value)}
        >
          <option value="">Choose one</option>
          {PRODUCT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field
        label="Production or batch code"
        required
        error={errors.productionCode}
        hint="Usually on the bottom, crimp, or back of the package."
      >
        <TextInput
          value={form.productionCode}
          autoComplete="off"
          onChange={(event) => update("productionCode", event.target.value)}
        />
      </Field>
      <button
        type="button"
        className="self-start text-sm font-medium text-sage"
        onClick={() => update("productionCode", "UNKNOWN")}
      >
        I can’t find it
      </button>

      <Field
        label="Opened date"
        error={errors.openedDate}
        hint="If you remember when you first used it."
      >
        <TextInput
          type="date"
          value={form.openedDate}
          onChange={(event) => update("openedDate", event.target.value)}
        />
      </Field>

      <button
        type="button"
        className="self-start text-sm font-medium text-sage"
        onClick={() => {
          const next = !showStorage;
          setShowStorage(next);
          update("includeStorage", next);
        }}
      >
        {showStorage ? "Hide storage details" : "Add storage details"}
      </button>

      {showStorage ? (
        <div className="grid gap-4 rounded-3xl bg-white p-4 ring-1 ring-ink/10">
          <Field label="Humidity">
            <SelectInput
              value={form.humidity}
              onChange={(event) =>
                update("humidity", event.target.value as ProductFormValue["humidity"])
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </SelectInput>
          </Field>
          <Field label="Temperature">
            <SelectInput
              value={form.temperature}
              onChange={(event) =>
                update("temperature", event.target.value as ProductFormValue["temperature"])
              }
            >
              <option value="cool">Cool</option>
              <option value="room">Room</option>
              <option value="warm">Warm</option>
            </SelectInput>
          </Field>
          <Field label="Sun exposure">
            <SelectInput
              value={form.sunExposure}
              onChange={(event) =>
                update("sunExposure", event.target.value as ProductFormValue["sunExposure"])
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </SelectInput>
          </Field>
        </div>
      ) : null}

      {formError ? (
        <p className="rounded-2xl bg-terra-soft px-4 py-3 text-sm leading-6 text-terra">{formError}</p>
      ) : null}

      <div className="mt-auto pt-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Checking product..." : "Check expiration"}
        </Button>
      </div>
    </form>
  );
}
