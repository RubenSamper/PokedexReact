import { useQuery } from "@tanstack/react-query";

const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=1025";

/**
 * Obtiene solo la lista de nombres e IDs de todos los Pokémon (1 llamada API).
 * Ya NO obtiene detalles (sprites, types) — eso se hace bajo demanda en usePokemonBatch.
 */
async function fetchPokemonList() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error fetching Pokémon list");
    const data = await res.json();

    return data.results.map((p) => {
        const id = parseInt(p.url.split("/").filter(Boolean).pop(), 10);
        return { id, name: p.name };
    });
}

export function usePokemonList() {
    return useQuery({
        queryKey: ["pokemonList"],
        queryFn: fetchPokemonList,
        staleTime: 1000 * 60 * 5,
    });
}
