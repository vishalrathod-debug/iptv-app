import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useChannels } from "../hooks/useChannels";
import CountryCard from "../components/CountryCard";

function Countries() {
  const { channels, loading, error } = useChannels();
  const navigate = useNavigate();

  const countries = useMemo(() => {
    const map = new Map();
    channels.forEach((channel) => {
      const country = channel.country || "Unknown";
      map.set(country, (map.get(country) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([country, count]) => ({ country, count }));
  }, [channels]);

  const handleCountrySelect = (country) => {
    const params = new URLSearchParams();
    params.set("search", country);
    params.set("source", "app");
    navigate({ pathname: "/", search: params.toString() });
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold text-white">Countries</h1>
        <p className="mt-2 text-slate-400">Explore IPTV channels by country and region.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {countries.map((item) => (
          <CountryCard
            key={item.country}
            country={item.country}
            count={item.count}
            onSelect={handleCountrySelect}
          />
        ))}
      </div>

      {loading && <p className="text-center text-slate-400">Loading countries...</p>}
      {error && <p className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
    </div>
  );
}

export default Countries;
