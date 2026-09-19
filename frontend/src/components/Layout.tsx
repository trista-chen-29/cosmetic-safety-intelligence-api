import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold tracking-wide text-ink/80">
            Shelf Check
          </Link>
          <Link
            to="/saved"
            className="rounded-full px-3 py-2 text-sm font-medium text-sage min-h-11 inline-flex items-center"
          >
            Saved
          </Link>
        </header>
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
