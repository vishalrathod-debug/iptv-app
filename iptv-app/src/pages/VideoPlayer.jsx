import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

function VideoPlayer({ url, onError, compact = false, customHeight }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const onErrorRef = useRef(onError);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audioTracks, setAudioTracks] = useState([]);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(-1);
  const [selectedSubtitle, setSelectedSubtitle] = useState(-1);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls;
    let htmlErrorListener;
    setLoading(true);
    setError("");
    setAudioTracks([]);
    setSubtitleTracks([]);
    setSelectedAudio(-1);
    setSelectedSubtitle(-1);

    const handlePlaybackError = (message) => {
      setError(message);
      setLoading(false);
      const callback = onErrorRef.current;
      if (typeof callback === "function") {
        setTimeout(() => callback(), 0);
      }
    };

    const isMixedContentBlocked =
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      typeof url === "string" &&
      url.startsWith("http:");

    if (isMixedContentBlocked) {
      handlePlaybackError("Mixed content blocked. Switching to next available stream.");
      return;
    }

    const syncTracks = () => {
      if (!hls) return;
      const audio = hls.audioTracks.map((track, index) => ({ ...track, id: index }));
      const subtitles = hls.subtitleTracks.map((track, index) => ({ ...track, id: index }));
      setAudioTracks(audio);
      setSubtitleTracks(subtitles);
      setSelectedAudio(hls.audioTrack ?? -1);
      setSelectedSubtitle(hls.subtitleTrack ?? -1);
    };

    if (Hls.isSupported()) {
      hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        syncTracks();
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, syncTracks);
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, syncTracks);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          handlePlaybackError("Stream unavailable. Moving to the next available channel...");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      htmlErrorListener = () => handlePlaybackError("Stream unavailable. Moving to the next available channel...");
      video.addEventListener("error", htmlErrorListener);
      video.addEventListener("loadedmetadata", () => setLoading(false));
    } else {
      handlePlaybackError("Playback not supported in this browser.");
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      hlsRef.current = null;
      if (htmlErrorListener) {
        video.removeEventListener("error", htmlErrorListener);
      }
    };
  }, [url]);

  const selectAudioTrack = (trackId) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.audioTrack = Number(trackId);
    setSelectedAudio(Number(trackId));
  };

  const selectSubtitleTrack = (trackId) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.subtitleTrack = Number(trackId);
    setSelectedSubtitle(Number(trackId));
  };

  return (
    <div className={`rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-xl shadow-black/40 ${compact ? "p-3" : "p-4"}`}>
      {loading && <p className="mb-3 text-sm text-slate-400">Preparing stream...</p>}
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {(audioTracks.length > 1 || subtitleTracks.length > 0) && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {audioTracks.length > 1 && (
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span className="text-xs uppercase tracking-[0.3em] text-red-400">Audio track</span>
              <select
                value={selectedAudio}
                onChange={(event) => selectAudioTrack(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value={-1}>Auto / Default</option>
                {audioTracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name || track.lang || `Track ${track.id + 1}`}
                  </option>
                ))}
              </select>
            </label>
          )}

          {subtitleTracks.length > 0 && (
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span className="text-xs uppercase tracking-[0.3em] text-red-400">Captions</span>
              <select
                value={selectedSubtitle}
                onChange={(event) => selectSubtitleTrack(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value={-1}>Off</option>
                <option value={-2}>Auto</option>
                {subtitleTracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name || track.lang || `Caption ${track.id + 1}`}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <video
        ref={videoRef}
        controls
        autoPlay
        style={customHeight ? { height: `${customHeight}px` } : undefined}
        className={`${compact ? "h-64 md:h-72 lg:h-80 max-h-[45vh]" : "h-[380px] md:h-[420px] lg:h-[500px] max-h-[65vh]"} w-full rounded-3xl bg-black object-cover`}
      />
    </div>
  );
}

export default VideoPlayer;
