import { useQuery } from "@tanstack/react-query";

// Cache en memoria para nombres de objetos en español
const itemNameCache = {};
// Cache para datos de formas regionales
const formPokemonCache = {};

const REGIONAL_SUFFIXES = ["alola", "galar", "hisui", "paldea"];

async function fetchItemSpanishName(itemName) {
    if (itemNameCache[itemName]) return itemNameCache[itemName];
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/item/${itemName}`);
        if (!res.ok) return itemName;
        const data = await res.json();
        const spanish = data.names?.find((n) => n.language.name === "es");
        const name = spanish?.name || itemName;
        itemNameCache[itemName] = name;
        return name;
    } catch {
        return itemName;
    }
}

/**
 * Obtiene los datos de un Pokémon por nombre desde PokeAPI (con caché).
 */
async function fetchPokemonData(pokemonName) {
    if (formPokemonCache[pokemonName]) return formPokemonCache[pokemonName];
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if (!res.ok) return null;
        const data = await res.json();
        formPokemonCache[pokemonName] = data;
        return data;
    } catch {
        return null;
    }
}

/**
 * Detecta si un nombre de pokémon es una variante regional y devuelve el sufijo.
 * Ej: "vulpix-alola" → "alola", "ninetales" → null
 */
function detectRegionalSuffix(formName) {
    if (!formName) return null;
    for (const suffix of REGIONAL_SUFFIXES) {
        if (formName.endsWith(`-${suffix}`)) return suffix;
    }
    // Caso especial: "tapu-koko" no es regional, termina en "-koko"
    return null;
}

/**
 * Parsea la cadena evolutiva de PokeAPI y la aplana en una lista.
 * Si se proporciona un formName con sufijo regional (ej: "vulpix-alola"),
 * mapea cada evolución a su correspondiente variante regional.
 * Los nombres de objetos se traducen al español.
 */
async function fetchEvolutionChain(evolutionChainUrl, formName) {
    const res = await fetch(evolutionChainUrl);
    if (!res.ok) throw new Error("Error fetching evolution chain");
    const data = await res.json();

    const regionalSuffix = detectRegionalSuffix(formName);
    const flat = [];

    function walk(node, details) {
        const id = parseInt(
            node.species.url.split("/").filter(Boolean).pop(),
            10
        );
        const baseName = node.species.name;

        flat.push({
            id,
            name: baseName,
            details: details
                ? {
                      trigger: details.trigger?.name || null,
                      minLevel: details.min_level || null,
                      item: details.item?.name || null,
                      itemEs: null,
                  }
                : null,
        });
        for (const child of node.evolves_to) {
            walk(child, child.evolution_details?.[0] || null);
        }
    }

    walk(data.chain, null);

    // Si estamos viendo una variante regional, mapear las evoluciones
    if (regionalSuffix) {
        await Promise.all(flat.map(async (evo) => {
            const variantName = `${evo.name}-${regionalSuffix}`;
            const variantData = await fetchPokemonData(variantName);
            if (variantData) {
                evo.id = variantData.id;
                evo.name = variantData.name;
                evo.isRegional = true;
            }
        }));
    }

    // Traducir nombres de objetos a español
    const itemEntries = flat.filter((e) => e.details?.item);
    if (itemEntries.length > 0) {
        const translations = await Promise.all(
            itemEntries.map((e) => fetchItemSpanishName(e.details.item))
        );
        itemEntries.forEach(
            (e, i) => (e.details.itemEs = translations[i])
        );
    }

    return flat;
}

export function useEvolutionChain(evolutionChainUrl, formName) {
    return useQuery({
        queryKey: ["evolutionChain", evolutionChainUrl, formName],
        queryFn: () => fetchEvolutionChain(evolutionChainUrl, formName),
        enabled: !!evolutionChainUrl,
        staleTime: 1000 * 60 * 10,
    });
}

/**
 * Devuelve texto legible en español para un detalle de evolución.
 */
export function formatEvolutionDetail(details) {
    if (!details) return "";

    switch (details.trigger) {
        case "level-up":
            return details.minLevel ? `Nv. ${details.minLevel}` : "Nivel";
        case "use-item":
            return details.itemEs || details.item || "Objeto";
        case "trade":
            return "Intercambio";
        case "shed":
            return "Muda";
        default:
            return details.trigger || "";
    }
}
