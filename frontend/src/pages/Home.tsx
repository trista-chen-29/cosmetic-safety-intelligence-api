import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disclaimer } from "../components/Disclaimer";
import { useSession } from "../state/session";
import { fileToPhoto } from "../utils/photo";
import { loadSavedProducts } from "../utils/storage";

export function HomePage() {
  const navigate = useNavigate();
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const { setDraftPhoto, setSession } = useSession();
  const [error, setError] = useState("");
  const savedCount = loadSavedProducts().length;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const photo = await fileToPhoto(file);
      setSession(null);
      setDraftPhoto(photo);
      navigate("/scan");
    } catch {
      setError("Could not read that photo. Try taking it again.");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col justify-center pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-sage">Cosmetic Safety</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Snap a product.
          <br />
          See if it still looks okay.
        </h1>
        <p className="mt-4 max-w-sm text-base leading-7 text-muted">
          Take a photo of makeup or skincare, add a few details, and get an estimated expiration
          check.
        </p>

        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <input
          ref={libraryInput}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => cameraInput.current?.click()}
          className="mt-10 flex min-h-40 w-full flex-col items-center justify-center rounded-[2rem] bg-sage text-white shadow-lg shadow-sage/20"
        >
          <CameraIcon />
          <span className="mt-3 text-lg font-semibold">Scan a product</span>
          <span className="mt-1 text-sm text-white/80">Uses your camera</span>
        </button>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => libraryInput.current?.click()}
            className="min-h-12 rounded-2xl bg-white text-sm font-semibold text-ink ring-1 ring-ink/10"
          >
            Choose photo
          </button>
          <Link
            to="/scan"
            onClick={() => {
              setDraftPhoto(null);
              setSession(null);
            }}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-ink ring-1 ring-ink/10"
          >
            Type it in
          </Link>
        </div>

        {error ? <p className="mt-4 text-sm text-terra">{error}</p> : null}
      </div>

      <Link to="/saved" className="mb-4 text-center text-sm font-medium text-sage">
        {savedCount > 0 ? `View ${savedCount} saved product${savedCount === 1 ? "" : "s"}` : "Saved products"}
      </Link>
      <Disclaimer compact />
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7.5 9.2 6h5.6L16 7.5h1.5A2.5 2.5 0 0 1 20 10v7.5A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5V10a2.5 2.5 0 0 1 2.5-2.5H8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
