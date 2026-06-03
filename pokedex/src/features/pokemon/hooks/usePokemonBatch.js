import { useQueries } from "@tanstack/react-query";

async function fetchOne(id) {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!r.ok) throw new Error(`Error fetching Pokémon #${id}`);
    const detail = await r.json();
    return {
        id: detail.id,
        name: detail.name,
        sprites: detail.sprites,
        types: detail.types,
    };
}

export function usePokemonBatch(ids) {
    const results = useQueries({
        queries: (ids || []).map((id) => ({
            queryKey: ["pokemon", id],
            queryFn: () => fetchOne(id),
            staleTime: 1000 * 60 * 30,
            enabled: ids.length > 0,
        })),
    });

    const data = results
        .filter((r) => r.data)
        .map((r) => r.data);

    const isLoading = results.some((r) => r.isLoading);
    const isFetching = results.some((r) => r.isFetching);
    const isError = results.some((r) => r.isError);

    return { data, isLoading, isFetching, isError };
}
