export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-center text-xs leading-5 text-muted">
        Estimates only. Check the label and the product itself before using it.
      </p>
    );
  }

  return (
    <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6 text-muted">
      This is an estimate for educational guidance. Check the product label and contact the
      manufacturer when safety is uncertain. Do not treat this as medical, regulatory, or
      manufacturer-certified advice.
    </p>
  );
}
