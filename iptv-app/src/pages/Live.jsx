import { useEffect, useMemo, useState } from "react";
import { useChannels } from "../hooks/useChannels";
import ChannelCard from "../components/ChannelCard";
import VideoPlayer from "./VideoPlayer";

const FAVORITES_KEY = "iptv-app-favorites";

function getStoredFavorites() {
  if (typeof localStorage === "undefined") return [];
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

function saveFavorites(favorites) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function Live() {
  const { channels, loading, error } = useChannels();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [failedChannels, setFailedChannels] = useState(new Set());
  const [playbackError, setPlaybackError] = useState("");
  const [favorites, setFavorites] = useState(() => getStoredFavorites());

  const liveChannels = useMemo(() => channels.slice(0, 24), [channels]);

  useEffect(() => {
    if (!selectedChannel && liveChannels.length > 0) {
      setSelectedChannel(liveChannels[0]);
    }
  }, [liveChannels, selectedChannel]);

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

  const handlePlaybackError = () => {
    if (!selectedChannel) return;
    setFailedChannels((prev) => new Set(prev).add(selectedChannel.id));
    const nextChannel = getNextChannel(selectedChannel, liveChannels);
    if (nextChannel) {
      setPlaybackError("");
      setSelectedChannel(nextChannel);
    } else {
      setPlaybackError("No playable live channels are available right now.");
    }
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

  const handlePreviousChannel = () => {
    if (!selectedChannel) return;
    const previousChannel = getPrevChannel(selectedChannel, liveChannels);
    setSelectedChannel(previousChannel);
  };

  const handleNextChannel = () => {
    if (!selectedChannel) return;
    const nextChannel = getNextChannel(selectedChannel, liveChannels);
    setSelectedChannel(nextChannel);
  };

  const handleToggleFavorite = (channel) => {
    if (!channel) return;
    const exists = favorites.some((item) => item.id === channel.id);
    const nextFavorites = exists
      ? favorites.filter((item) => item.id !== channel.id)
      : [channel, ...favorites];
    setFavorites(nextFavorites);
    saveFavorites(nextFavorites);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Live channels</h1>
            <p className="mt-2 text-slate-300">Tune in to live television channels from around the world.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-inner shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-red-400">Now playing</p>
            <p className="mt-2 text-lg text-white">{selectedChannel?.name || "Pick a stream"}</p>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-inner shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-red-400">Current stream</p>
              <p className="mt-2 text-lg text-white">{selectedChannel?.name || "Pick a stream"}</p>
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
          {selectedChannel && !failedChannels.has(selectedChannel.id) ? (
            <VideoPlayer url={selectedChannel.stream} onError={handlePlaybackError} />
          ) : (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
              <p className="font-semibold text-white">Unable to play current stream.</p>
              <p className="mt-2">{playbackError || "Please select another channel."}</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-4">
        {liveChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onPlay={setSelectedChannel}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.some((item) => item.id === channel.id)}
          />
        ))}
      </div>

      {loading && <p className="text-center text-slate-400">Loading live data...</p>}
      {error && <p className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
    </div>
  );
}

export default Live;
