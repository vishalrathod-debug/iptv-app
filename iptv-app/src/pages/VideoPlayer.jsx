import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

function VideoPlayer({ url, onError, compact = false }) {
  const videoRef = useRef(null);
  const onErrorRef = useRef(onError);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
      });

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
      if (hls) hls.destroy();
      if (htmlErrorListener) {
        video.removeEventListener("error", htmlErrorListener);
      }
    };
  }, [url]);

  return (
    <div className={`rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-xl shadow-black/40 ${compact ? "p-3" : "p-4"}`}>
      {loading && <p className="mb-3 text-sm text-slate-400">Preparing stream...</p>}
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      <video
        ref={videoRef}
        controls
        autoPlay
        className={`${compact ? "h-64" : "h-[380px]"} w-full rounded-3xl bg-black object-cover`}
      />
    </div>
  );
}

export default VideoPlayer;
