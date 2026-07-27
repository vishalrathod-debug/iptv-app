import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useLocation } from "react-router-dom";
import { useChannels } from "../hooks/useChannels";
import ChannelCard from "../components/ChannelCard";
import SearchBar from "../components/SearchBar";
import VideoPlayer from "./VideoPlayer";

const FAVORITES_KEY = "iptv-app-favorites";
const PAGE_SIZE = 18;

function getStoredFavorites() {
  if (typeof localStorage === "undefined") return [];
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function Home() {
  const { channels, loading, error } = useChannels();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [favorites, setFavorites] = useState(() => getStoredFavorites());
  const [failedChannels, setFailedChannels] = useState(new Set());
  const [playbackError, setPlaybackError] = useState("");
  const [page, setPage] = useState(1);
  const [visibleChannels, setVisibleChannels] = useState([]);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.4 });
  const { ref: playerSentinelRef, inView: playerInView } = useInView({ threshold: 0, rootMargin: '-1px 0px 0px 0px' });
  const [playerPosition, setPlayerPosition] = useState({ x: 24, y: 24 });
  const [playerSize, setPlayerSize] = useState({ width: 900, height: 360 });
  const [playerDragOffset, setPlayerDragOffset] = useState(null);
  const [playerDragging, setPlayerDragging] = useState(false);
  const [playerResizeOffset, setPlayerResizeOffset] = useState(null);
  const [playerResizing, setPlayerResizing] = useState(false);
  const dragHandleRef = useRef(null);
  const asideRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPlayerPosition({ x: 24, y: Math.max(24, window.innerHeight - 360) });
    }
  }, []);

  useEffect(() => {
    if (!playerDragging || !playerDragOffset) return;

    const handlePointerMove = (event) => {
      const maxX = Math.max(24, window.innerWidth - 920);
      const maxY = Math.max(24, window.innerHeight - 320);
      const nextX = Math.min(Math.max(24, event.clientX - playerDragOffset.x), maxX);
      const nextY = Math.min(Math.max(24, event.clientY - playerDragOffset.y), maxY);
      setPlayerPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setPlayerDragging(false);
      setPlayerDragOffset(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [playerDragging, playerDragOffset]);

  useEffect(() => {
    if (!playerResizing || !playerResizeOffset) return;

    const handleResizeMove = (event) => {
      const minWidth = 320;
      const minHeight = 240;
      const maxWidth = Math.max(420, window.innerWidth - 48);
      const maxHeight = Math.max(280, window.innerHeight - 120);
      const deltaX = event.clientX - playerResizeOffset.pointerX;
      const deltaY = event.clientY - playerResizeOffset.pointerY;
      const nextWidth = Math.min(Math.max(minWidth, playerResizeOffset.width + deltaX), maxWidth);
      const nextHeight = Math.min(Math.max(minHeight, playerResizeOffset.height + deltaY), maxHeight);
      setPlayerSize({ width: nextWidth, height: nextHeight });
    };

    const handleResizeUp = () => {
      setPlayerResizing(false);
      setPlayerResizeOffset(null);
    };

    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("pointerup", handleResizeUp);

    return () => {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handleResizeUp);
    };
  }, [playerResizing, playerResizeOffset]);

  const handlePlayerDragStart = (event) => {
    if (!playerPinned || !asideRef.current) return;
    const rect = asideRef.current.getBoundingClientRect();
    setPlayerDragging(true);
    setPlayerDragOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePlayerResizeStart = (event) => {
    if (!playerPinned || !asideRef.current) return;
    const rect = asideRef.current.getBoundingClientRect();
    setPlayerResizing(true);
    setPlayerResizeOffset({
      width: rect.width,
      height: rect.height,
      pointerX: event.clientX,
      pointerY: event.clientY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  useEffect(() => {
    if (!selectedChannel && channels.length > 0) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("source") !== "app") return;
    const currentSearch = params.get("search") || "";
    if (currentSearch.trim()) {
      setQuery(currentSearch);
      setSelectedCategory("");
    }
  }, [location.search]);

  const filteredChannels = useMemo(() => {
    const search = query.trim().toLowerCase();
    return channels.filter((channel) => {
      const name = channel.name?.toLowerCase() || "";
      const country = channel.country?.toLowerCase() || "";
      const category = channel.category?.toLowerCase() || "";
      const id = (channel.id || "").toLowerCase();
      const matchesCategory = selectedCategory
        ? category === selectedCategory.toLowerCase()
        : true;
      const matchesSearch = search
        ? name.includes(search) || country.includes(search) || category.includes(search) || id.includes(search)
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [channels, query, selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [filteredChannels]);

  useEffect(() => {
    setVisibleChannels(filteredChannels.slice(0, page * PAGE_SIZE));
  }, [filteredChannels, page]);

  useEffect(() => {
    if (!inView || loading) return;
    if (visibleChannels.length >= filteredChannels.length) return;
    setPage((prev) => prev + 1);
  }, [inView, loading, visibleChannels.length, filteredChannels.length]);

  const playerPinned = selectedChannel && !playerInView;
  const selectedChannelFailed = selectedChannel && failedChannels.has(selectedChannel.id);
  const hasMore = visibleChannels.length < filteredChannels.length;
  const bottomSpacerClass = playerPinned ? "h-64 md:h-72" : "h-0";

  const getNextChannel = (current, candidates) => {
    if (!current) return null;
    const startIndex = candidates.findIndex((channel) => channel.id === current.id);
    if (startIndex === -1) return null;

    for (let offset = 1; offset < candidates.length; offset += 1) {
      const nextChannel = candidates[(startIndex + offset) % candidates.length];
      if (!failedChannels.has(nextChannel.id)) {
        return nextChannel;
      }
    }

    return null;
  };

  const getPrevChannel = (current, candidates) => {
    if (!current) return null;
    const startIndex = candidates.findIndex((channel) => channel.id === current.id);
    if (startIndex === -1) return null;

    for (let offset = 1; offset < candidates.length; offset += 1) {
      const prevChannel = candidates[(startIndex - offset + candidates.length) % candidates.length];
      if (!failedChannels.has(prevChannel.id)) {
        return prevChannel;
      }
    }

    return null;
  };

  const handlePlaybackError = () => {
    if (!selectedChannel) return;
    setFailedChannels((prev) => new Set(prev).add(selectedChannel.id));
    const candidates = filteredChannels.length ? filteredChannels : channels;
    const nextChannel = getNextChannel(selectedChannel, candidates);
    if (nextChannel) {
      setPlaybackError("");
      setSelectedChannel(nextChannel);
    } else {
      setPlaybackError("No playable channels available in the current list.");
    }
  };

  const handlePreviousChannel = () => {
    if (!selectedChannel) return;
    const candidates = filteredChannels.length ? filteredChannels : channels;
    const previousChannel = getPrevChannel(selectedChannel, candidates);
    setSelectedChannel(previousChannel);
  };

  const handleNextChannel = () => {
    if (!selectedChannel) return;
    const candidates = filteredChannels.length ? filteredChannels : channels;
    const nextChannel = getNextChannel(selectedChannel, candidates);
    setSelectedChannel(nextChannel);
  };

  const topCategories = useMemo(() => {
    const map = new Map();
    channels.forEach((channel) => {
      const category = channel.category || "General";
      map.set(category, (map.get(category) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, count]) => ({ category, count }));
  }, [channels]);

  const handleToggleFavorite = (channel) => {
    const exists = favorites.some((item) => item.id === channel.id);
    const nextFavorites = exists
      ? favorites.filter((item) => item.id !== channel.id)
      : [channel, ...favorites];
    setFavorites(nextFavorites);
    saveFavorites(nextFavorites);
  };

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.6fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_35%)] p-8 shadow-2xl shadow-black/40">
          <span className="inline-flex rounded-full bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-black">
            Featured
          </span>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Discover live channels with a premium streaming experience.
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Browse top IPTV channels, save favorites, and watch instantly with a Netflix-style interface designed for TV lovers.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-sm uppercase text-slate-400">Available channels</p>
                <p className="mt-2 text-3xl font-semibold text-white">{channels.length}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-sm uppercase text-slate-400">Popular genres</p>
                <p className="mt-2 text-3xl font-semibold text-white">{topCategories.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div ref={playerSentinelRef} className="absolute inset-x-0 top-0 h-px" />
          <aside
            ref={asideRef}
            className={`rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/40 transition-all duration-300 ${
              playerPinned
                ? "fixed z-50 border-white/20 bg-slate-950/95 backdrop-blur-xl shadow-2xl max-h-[calc(100vh-6rem)] overflow-hidden"
                : "sticky top-24"
            }`}
            style={
              playerPinned
                ? {
                    left: playerPosition.x,
                    top: playerPosition.y,
                    width: `${playerSize.width}px`,
                  }
                : undefined
            }
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-slate-300">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  ref={dragHandleRef}
                  type="button"
                  onPointerDown={handlePlayerDragStart}
                  className="cursor-grab rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300 transition hover:border-red-400 hover:text-white"
                >
                  Drag
                </button>
                <button
                  type="button"
                  onPointerDown={handlePlayerResizeStart}
                  className="cursor-nwse-resize rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300 transition hover:border-red-400 hover:text-white"
                >
                  Resize
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-red-400">Now playing</p>
                  <p className="text-lg font-semibold text-white">{selectedChannel?.name || "Select a channel"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePreviousChannel}
                  disabled={!selectedChannel}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-500 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-slate-400"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => selectedChannel && handleToggleFavorite(selectedChannel)}
                  disabled={!selectedChannel}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-red-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-white/10"
                >
                  {favorites.some((item) => item.id === selectedChannel?.id) ? "Unfavorite" : "Favorite"}
                </button>
                <button
                  type="button"
                  onClick={handleNextChannel}
                  disabled={!selectedChannel}
                  className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:bg-white/10"
                >
                  Next channel
                </button>
              </div>
            </div>
            {selectedChannel && !selectedChannelFailed ? (
              <VideoPlayer
                url={selectedChannel.stream}
                onError={handlePlaybackError}
                compact={playerPinned}
                customHeight={playerPinned ? playerSize.height : undefined}
              />
            ) : (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
                <p className="font-semibold text-white">Unable to play current channel.</p>
                <p className="mt-2">{playbackError || "Try selecting a different channel."}</p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-white">Browse channels</h2>
              <p className="mt-2 text-slate-400">Scroll to load more channels automatically as you explore.</p>
              <p className="mt-2 text-sm text-slate-500">
                Showing {visibleChannels.length} of {filteredChannels.length} channel{filteredChannels.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="w-full max-w-md">
              <SearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-sm transition ${
                !selectedCategory
                  ? "border-red-500 bg-red-500 text-black"
                  : "border-white/10 bg-white/5 text-white hover:border-red-500"
              }`}
              onClick={() => setSelectedCategory("")}
            >
              All genres
            </button>
            {topCategories.map((item) => (
              <button
                key={item.category}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedCategory === item.category
                    ? "border-red-500 bg-red-500 text-black"
                    : "border-white/10 bg-white/5 text-white hover:border-red-500"
                }`}
                onClick={() => setSelectedCategory(item.category)}
              >
                {item.category} ({item.count})
              </button>
            ))}
          </div>
        </div>

        {filteredChannels.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">
            <h3 className="text-xl font-semibold text-white">No channels available</h3>
            <p className="mt-2">Try a different genre or search term.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onPlay={setSelectedChannel}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.some((item) => item.id === channel.id)}
                  isSelected={selectedChannel?.id === channel.id}
                />
              ))}
            </div>
            <div className={bottomSpacerClass} />
          </>
        )}
        <div ref={loadMoreRef} className="h-24 flex items-center justify-center text-slate-400">
          {loading
            ? "Loading channels..."
            : hasMore
            ? "Scroll down to load more channels..."
            : "You’ve reached the end of the channel list."}
        </div>

      </section>

      {error && <p className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
    </div>
  );
}

export default Home;
