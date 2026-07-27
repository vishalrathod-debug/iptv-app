import { Heart, Play } from "lucide-react";

function ChannelCard({ channel, onPlay, onToggleFavorite, isFavorite, isSelected }) {
  return (
    <article className={`group rounded-3xl bg-white/5 border p-4 shadow-xl shadow-black/20 transition hover:-translate-y-1 ${isSelected ? "border-red-500 bg-red-500/10" : "border-white/10 hover:border-red-500"}`}>
      <div className="relative overflow-hidden rounded-2xl bg-slate-900">
        <img
          src={channel.logo}
          alt={channel.name}
          className="h-44 w-full object-contain bg-black/70 p-4"
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
          <p className="text-sm uppercase tracking-[0.2em] text-red-400">
            {channel.country || "Unknown"}
          </p>
          <h2 className="text-lg font-semibold text-white">{channel.name}</h2>
          <p className="text-sm text-slate-400 line-clamp-2">
            {channel.category || "General"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onPlay(channel)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <Play size={16} />
          Watch
        </button>
      </div>
    </article>
  );
}

export default ChannelCard;
