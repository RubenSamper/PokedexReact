import { useQuery } from "@tanstack/react-query";

const ULTRA_BEASTS = [
    "nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela",
    "kartana", "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon",
];

const PSEUDO_LEGENDARIES = [
    "dragonite", "tyranitar", "salamence", "metagross", "garchomp",
    "hydreigon", "goodra", "kommo-o", "dragapult", "baxcalibur",
];

const GENERATION_MAP = {
    "generation-i": "Generación I",
    "generation-ii": "Generación II",
    "generation-iii": "Generación III",
    "generation-iv": "Generación IV",
    "generation-v": "Generación V",
    "generation-vi": "Generación VI",
    "generation-vii": "Generación VII",
    "generation-viii": "Generación VIII",
    "generation-ix": "Generación IX",
};

function getGenerationName(generation) {
    if (!generation?.name) return null;
    return GENERATION_MAP[generation.name] || null;
}

function getClassification({ isLegendary, isMythical, isBaby }, pokemonName) {
    const nameLower = pokemonName?.toLowerCase();

    if (isLegendary) return "Legendario";
    if (isMythical) return "Mítico";
    if (ULTRA_BEASTS.includes(nameLower)) return "Ultraente";
    if (PSEUDO_LEGENDARIES.includes(nameLower)) return "Pseudolegendario";
    if (isBaby) return "Bebé";

    return null;
}

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
    let isLegendary = false;
    let isMythical = false;
    let isBaby = false;
    let generation = null;

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

        // Nuevos campos de la especie
        isLegendary = species.is_legendary ?? false;
        isMythical = species.is_mythical ?? false;
        isBaby = species.is_baby ?? false;
        generation = species.generation || null;
    }

    const isUltraBeast = ULTRA_BEASTS.includes(pokemon.name.toLowerCase());
    const isPseudoLegendary = PSEUDO_LEGENDARIES.includes(
        pokemon.name.toLowerCase()
    );

    const classification = getClassification(
        { isLegendary, isMythical, isBaby },
        pokemon.name
    );

    const generationName = getGenerationName(generation);

    return {
        ...pokemon,
        nameEs,
        descriptionEs,
        evolutionChainUrl,
        varieties,
        isLegendary,
        isMythical,
        isBaby,
        isUltraBeast,
        isPseudoLegendary,
        classification,
        generationName,
    };
}

export function usePokemon(name) {
    return useQuery({
        queryKey: ["pokemon", name],
        queryFn: () => fetchPokemon(name),
        enabled: !!name,
        staleTime: 1000 * 60 * 5,
    });
}
