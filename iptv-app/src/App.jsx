import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./pages/Navbar";

const Home = lazy(() => import("./pages/Home"));
const Live = lazy(() => import("./pages/Live"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Countries = lazy(() => import("./pages/Countries"));
const Categories = lazy(() => import("./pages/Categories"));
const NotFound = lazy(() => import("./pages/NotFound"));

const routes = [
  { path: "/", element: <Home /> },
  { path: "/live", element: <Live /> },
  { path: "/favorites", element: <Favorites /> },
  { path: "/countries", element: <Countries /> },
  { path: "/categories", element: <Categories /> },
  { path: "*", element: <NotFound /> },
];

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <Suspense
          fallback={
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-300">
              Loading application...
            </div>
          }
        >
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
