function CategoryCard({ category, count, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(category)}
      className="group rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/95 p-6 text-left transition hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-red-300">Genre</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">{count}</span>
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-white">{category}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">Browse all channels tagged with this category.</p>
    </button>
  );
}

export default CategoryCard;
