import { useQuery } from "@tanstack/react-query";

/**
 * Obtiene los nombres de Pokémon que coinciden con TODOS los tipos seleccionados.
 * Usa /type/{name} de PokeAPI para obtener listas y las interseca.
 * 0-2 llamadas API en lugar de tener que fetchear cada Pokémon individual.
 */
async function fetchTypeFilter(selectedTypes) {
    const lists = await Promise.all(
        selectedTypes.map((type) =>
            fetch(`https://pokeapi.co/api/v2/type/${type}`)
                .then((r) => {
                    if (!r.ok) throw new Error(`Error fetching type ${type}`);
                    return r.json();
                })
                .then((d) => d.pokemon.map((p) => p.pokemon.name))
        )
    );

    // Intersección AND: Pokémon deben tener TODOS los tipos seleccionados
    return lists.reduce((acc, list) => acc.filter((name) => list.includes(name)));
}

export function useTypeFilter(selectedTypes) {
    return useQuery({
        queryKey: ["typeFilter", [...selectedTypes].sort()],
        queryFn: () => fetchTypeFilter(selectedTypes),
        enabled: selectedTypes.length > 0,
        staleTime: 1000 * 60 * 10,
    });
}
