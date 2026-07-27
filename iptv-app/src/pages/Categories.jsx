import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useChannels } from "../hooks/useChannels";
import CategoryCard from "../components/CategoryCard";

function Categories() {
  const { channels, loading, error } = useChannels();
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const map = new Map();
    channels.forEach((channel) => {
      const category = channel.category || "General";
      map.set(category, (map.get(category) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([category, count]) => ({ category, count }));
  }, [channels]);

  const handleCategorySelect = (category) => {
    const params = new URLSearchParams();
    params.set("search", category);
    params.set("source", "app");
    navigate({ pathname: "/", search: params.toString() });
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold text-white">Genres</h1>
        <p className="mt-2 text-slate-400">Browse channels by genre and category.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((item) => (
          <CategoryCard
            key={item.category}
            category={item.category}
            count={item.count}
            onSelect={handleCategorySelect}
          />
        ))}
      </div>

      {loading && <p className="text-center text-slate-400">Loading genres...</p>}
      {error && <p className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
    </div>
  );
}

export default Categories;
