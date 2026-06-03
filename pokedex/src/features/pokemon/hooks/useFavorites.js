import { useEffect, useState } from "react";

const STORAGE_KEY = "pokedex_favorites";

export function useFavorites() {
    const [favorites, setFavorites] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("useFavorites: failed to read favorites from localStorage", e);
            return [];
        }
    });

    // Guardar favoritos cuando cambien (solo escribe, no provoca setState aquí)
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (e) {
            console.error("useFavorites: failed to save favorites to localStorage", e);
        }
    }, [favorites]);

    const toggleFavorite = (id) => {
        setFavorites((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            const exists = list.includes(id);
            return exists ? list.filter((f) => f !== id) : [...list, id];
        });
    };

    const isFavorite = (id) => Array.isArray(favorites) && favorites.includes(id);

    return { favorites, toggleFavorite, isFavorite };
}
