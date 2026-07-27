import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-red-400">404</p>
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="max-w-xl text-slate-400">
        The page you were looking for does not exist. Return to the home screen to continue browsing channels.
      </p>
      <Link
        to="/"
        className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-red-600"
      >
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
