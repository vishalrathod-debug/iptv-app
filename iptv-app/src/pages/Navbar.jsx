import { useState } from "react";
import { Menu, Tv } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/live", label: "Live" },
  { to: "/categories", label: "Genres" },
  { to: "/countries", label: "Countries" },
  { to: "/favorites", label: "Favorites" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
      params.set("source", "app");
    }
    navigate({ pathname: "/", search: params.toString() });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-white">
            <Tv className="text-red-500" size={28} />
            <div>
              <p className="font-semibold text-white">IPTV Hub</p>
              <p className="text-sm text-slate-400">Stream like a pro</p>
            </div>
          </Link>

          <button
            type="button"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-3 text-white md:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 md:block ${open ? "max-h-80" : "max-h-0 md:max-h-full"}`}>
          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:gap-5 md:border-none md:bg-transparent md:p-0">
              <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-3">
              <div className="w-full md:max-w-xl">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch("")}
                  placeholder="Search channels, themes, or countries here"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-red-600"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3 justify-between md:justify-end">
              <nav className="grid gap-3 md:grid-flow-col md:auto-cols-max md:items-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? "rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-black"
                      : "rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
