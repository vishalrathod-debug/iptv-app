function SearchBar({ value, onChange, onClear, placeholder = "Search channels, themes, or countries here" }) {
  return (
    <label className="group relative block w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 focus-within:border-red-500">
      <span className="sr-only">Search</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        className="w-full bg-transparent text-white outline-none placeholder:text-slate-400"
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            onClear();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/20"
        >
          Clear
        </button>
      ) : null}
    </label>
  );
}

export default SearchBar;
