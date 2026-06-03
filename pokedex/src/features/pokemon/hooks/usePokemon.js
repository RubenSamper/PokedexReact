import { useQuery } from "@tanstack/react-query";

async function fetchPokemon(name) {
    // 1) Fetch Pokémon + especie EN PARALELO
    const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${name}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}/`).catch(
            () => null
        ),
    ]);

    if (!pokemonRes.ok) throw new Error("Error fetching Pokémon");

    const pokemon = await pokemonRes.json();

    // Valores por defecto
    let nameEs =
        pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    let descriptionEs = "";
    let evolutionChainUrl = "";
    let varieties = [];

    if (speciesRes?.ok) {
        const species = await speciesRes.json();

        const spanishName = species.names?.find(
            (n) => n.language.name === "es"
        );
        if (spanishName) nameEs = spanishName.name;

        const spanishEntry = species.flavor_text_entries?.find(
            (e) => e.language.name === "es"
        );
        if (spanishEntry) {
            descriptionEs = spanishEntry.flavor_text
                .replace(/[\f\n\r]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        evolutionChainUrl = species.evolution_chain?.url || "";

        // Extraer variedades (formas alternativas: mega, gmax, regionales)
        varieties = (species.varieties || [])
            .filter((v) => !v.is_default)
            .map((v) => ({ name: v.pokemon.name }));
    }

    return { ...pokemon, nameEs, descriptionEs, evolutionChainUrl, varieties };
}

export function usePokemon(name) {
    return useQuery({
        queryKey: ["pokemon", name],
        queryFn: () => fetchPokemon(name),
        enabled: !!name,
        staleTime: 1000 * 60 * 5,
    });
}
