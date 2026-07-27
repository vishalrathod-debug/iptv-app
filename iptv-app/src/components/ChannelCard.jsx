import { Heart, Play } from "lucide-react";

function ChannelCard({ channel, onPlay, onToggleFavorite, isFavorite, isSelected }) {
  return (
    <article
      className={`group cursor-pointer overflow-hidden rounded-3xl border p-4 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-red-500 hover:bg-white/10 ${
        isSelected ? "border-red-500 bg-red-500/10" : "border-white/10 bg-slate-900/80"
      }`}
      onClick={() => onPlay(channel)}
    >
      <div className="relative overflow-hidden rounded-3xl bg-slate-950/90 shadow-inner shadow-black/40">
        <img
          src={channel.logo}
          alt={channel.name}
          className="h-44 w-full object-contain bg-black/80 p-4"
          loading="lazy"
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(channel);
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-red-500"
        >
          <Heart className={isFavorite ? "text-red-400" : "text-white/80"} size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-red-300">
              {channel.country || "Unknown"}
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              {channel.category || "General"}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-white">{channel.name}</h2>
          <p className="text-sm text-slate-400 line-clamp-2">Live TV stream</p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPlay(channel);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-black transition hover:from-red-600 hover:to-fuchsia-600"
        >
          <Play size={16} />
          Watch
        </button>
      </div>
    </article>
  );
}

export default ChannelCard;
