function CountryCard({ country, count }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center transition hover:border-red-500">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Country</p>
      <h3 className="mt-3 text-xl font-semibold text-white">{country}</h3>
      <p className="mt-2 text-sm text-slate-400">{count} channels</p>
    </div>
  );
}

export default CountryCard;
