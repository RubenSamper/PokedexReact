import { useQuery } from "@tanstack/react-query";

// Cache en memoria para nombres de objetos en español
const itemNameCache = {};

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
 * Parsea la cadena evolutiva de PokeAPI y la aplana en una lista.
 * Cada entrada incluye si tiene detalles de evolución (trigger, nivel, objeto).
 * Los nombres de objetos se traducen al español.
 */
async function fetchEvolutionChain(evolutionChainUrl) {
    const res = await fetch(evolutionChainUrl);
    if (!res.ok) throw new Error("Error fetching evolution chain");
    const data = await res.json();

    const flat = [];

    function walk(node, details) {
        const id = parseInt(
            node.species.url.split("/").filter(Boolean).pop(),
            10
        );
        flat.push({
            id,
            name: node.species.name,
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

export function useEvolutionChain(evolutionChainUrl) {
    return useQuery({
        queryKey: ["evolutionChain", evolutionChainUrl],
        queryFn: () => fetchEvolutionChain(evolutionChainUrl),
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
