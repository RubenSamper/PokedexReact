import { useQuery } from "@tanstack/react-query";

const TOTAL_SPECIES = 1025;
const BATCH_SIZE = 30;
const LS_KEY = "pokedex_spanish_name_map";

/**
 * Obtiene los nombres en español de todas las especies Pokémon.
 * Cachea el resultado en localStorage para no refetchear en visitas posteriores.
 */
async function fetchSpanishNameMap() {
    // Intentar leer de localStorage primero
    try {
        const cached = localStorage.getItem(LS_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === "object") return parsed;
        }
    } catch { /* ignorar */ }

    const ids = Array.from({ length: TOTAL_SPECIES }, (_, i) => i + 1);
    const map = {};

    // Partir en lotes pequeños para no saturar la API
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
            batch.map((id) =>
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`).then(
                    (r) => {
                        if (!r.ok) throw new Error(`Error fetching species #${id}`);
                        return r.json();
                    }
                )
            )
        );

        for (const result of results) {
            if (result.status === "fulfilled") {
                const species = result.value;
                const spanishName = species.names?.find(
                    (n) => n.language.name === "es"
                );
                if (spanishName) {
                    map[species.name.toLowerCase()] = spanishName.name.toLowerCase();
                }
            }
        }
    }

    // Persistir en localStorage para próximas visitas
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(map));
    } catch { /* ignorar */ }

    return map;
}

export function useSpanishNameMap() {
    return useQuery({
        queryKey: ["spanishNameMap"],
        queryFn: fetchSpanishNameMap,
        staleTime: 1000 * 60 * 60 * 24, // 24h (cambia muy raramente)
        retry: 2,
    });
}
