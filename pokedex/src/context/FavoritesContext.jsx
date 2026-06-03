import { createContext, useContext, useState, useCallback } from "react";

const STORAGE_KEY = "pokedex_favorites";

const FavoritesContext = createContext(null);

function readFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveFavorites(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.error("FavoritesContext: failed to save", e);
    }
}

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(readFavorites);

    const toggleFavorite = useCallback((id) => {
        const exists = favorites.includes(id);
        const next = exists
            ? favorites.filter((f) => f !== id)
            : [...favorites, id];
        saveFavorites(next);
        setFavorites(next);
    }, [favorites]);

    const isFavorite = useCallback(
        (id) => favorites.includes(id),
        [favorites]
    );

    const clearAll = useCallback(() => {
        saveFavorites([]);
        setFavorites([]);
    }, []);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearAll }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
    return ctx;
}
