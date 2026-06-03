import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// Restaurar ruta después de redirección desde 404.html (GitHub Pages)
function RedirectHandler({ children }) {
    const navigate = useNavigate();
    useEffect(() => {
        const redirect = sessionStorage.getItem("redirect");
        if (redirect) {
            sessionStorage.removeItem("redirect");
            const url = new URL(redirect);
            navigate(url.pathname.replace(/^\/PokedexReact/, "") || "/", { replace: true });
        }
    }, [navigate]);
    return children;
}
import Layout from "./Layout";
import HomePage from "./features/pokemon/pages/HomePage";
import { FilterProvider } from "./context/FilterContext";
import { ToastProvider } from "./context/ToastProvider";
import { FavoritesProvider } from "./context/FavoritesContext";

// Code splitting: cada página se carga solo cuando se navega a ella
const PokemonPage = lazy(() => import("./features/pokemon/pages/PokemonPage"));
const TeamsPage = lazy(() => import("./features/cobblemon/pages/TeamsPage"));
const ShinyPage = lazy(() => import("./features/cobblemon/pages/ShinyPage"));
const ItemsPage = lazy(() => import("./features/cobblemon/pages/ItemsPage"));
const ItemGroupPage = lazy(() => import("./features/cobblemon/pages/ItemGroupPage"));
const TeamBuilderPage = lazy(() => import("./features/teambuilder/pages/TeamBuilderPage"));
const ComparePage = lazy(() => import("./features/compare/pages/ComparePage"));
const FavoritesPage = lazy(() => import("./features/pokemon/pages/FavoritesPage"));

const SUSPENSE_FALLBACK = (
    <div
        style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "3rem",
            color: "var(--text-muted, #888)",
            fontStyle: "italic",
        }}
    >
        Cargando...
    </div>
);

export default function App() {
    return (
        <FilterProvider>
            <BrowserRouter basename="/PokedexReact">
                <FavoritesProvider>
                    <ToastProvider>
                        <Layout>
                            <Suspense fallback={SUSPENSE_FALLBACK}>
                                <RedirectHandler>
                                    <Routes>
                                        <Route path="/" element={<HomePage />} />
                                        <Route path="/pokemon/:name" element={<PokemonPage />} />
                                        <Route path="/teams" element={<TeamsPage />} />
                                        <Route path="/shinies" element={<ShinyPage />} />
                                        <Route path="/items" element={<ItemsPage />} />
                                        <Route path="/items/:slug" element={<ItemGroupPage />} />
                                        <Route path="/builder" element={<TeamBuilderPage />} />
                                        <Route path="/compare" element={<ComparePage />} />
                                        <Route path="/favorites" element={<FavoritesPage />} />
                                    </Routes>
                                </RedirectHandler>
                            </Suspense>
                        </Layout>
                    </ToastProvider>
                </FavoritesProvider>
            </BrowserRouter>
        </FilterProvider>
    );
}
