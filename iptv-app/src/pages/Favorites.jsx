import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChannelCard from "../components/ChannelCard";

const FAVORITES_KEY = "iptv-app-favorites";

function getStoredFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getStoredFavorites());
  }, []);

  const handleToggleFavorite = (channel) => {
    const nextFavorites = favorites.filter((item) => item.id !== channel.id);
    setFavorites(nextFavorites);
    saveFavorites(nextFavorites);
  };

  if (!favorites.length) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">
        <h1 className="text-3xl font-semibold text-white">No favorites yet</h1>
        <p className="mt-3 text-slate-400">Save channels from the home page to build your watchlist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-red-600">
          Browse channels
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold text-white">Your favorites</h1>
        <p className="mt-2 text-slate-400">Quickly launch the channels you watch most.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {favorites.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onPlay={() => null}
            onToggleFavorite={handleToggleFavorite}
            isFavorite
          />
        ))}
      </div>
    </div>
  );
}

export default Favorites;
