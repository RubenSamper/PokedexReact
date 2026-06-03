import { useQuery } from "@tanstack/react-query";

/**
 * Obtiene detalles completos (sprites, types) para un lote de IDs concreto.
 * Solo se llama con los IDs de la página visible (~20).
 */
async function fetchBatch(ids) {
    const results = await Promise.allSettled(
        ids.map((id) =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => {
                if (!r.ok) throw new Error(`Error fetching Pokémon #${id}`);
                return r.json();
            })
        )
    );

    return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value)
        .map((detail) => ({
            id: detail.id,
            name: detail.name,
            sprites: detail.sprites,
            types: detail.types,
        }));
}

export function usePokemonBatch(ids) {
    // Clave determinística para que React Query cachee correctamente
    const key = [...ids].sort((a, b) => a - b).join(",");

    return useQuery({
        queryKey: ["pokemonBatch", key],
        queryFn: () => fetchBatch(ids),
        enabled: ids.length > 0,
        staleTime: 1000 * 60 * 5,
        // Mantiene los datos previos mientras carga la nueva página
        placeholderData: (previousData) => previousData,
    });
}
