const BASE_URL = "https://iptv-org.github.io/api";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json();
}

export async function fetchChannelsWithStreams() {
  const [channels, streams] = await Promise.all([
    fetchJson(`${BASE_URL}/channels.json`),
    fetchJson(`${BASE_URL}/streams.json`),
  ]);

  const streamMap = new Map(
    streams
      .filter((stream) => stream.url && stream.channel)
      .map((stream) => [stream.channel, stream.url])
  );

  return channels
    .filter((channel) => streamMap.has(channel.id))
    .map((channel) => ({
      ...channel,
      stream: streamMap.get(channel.id),
      category: channel.categories?.[0] ?? "General",
      country: channel.country ?? "Unknown",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
