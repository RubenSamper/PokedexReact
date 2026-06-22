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
 * Parsea la cadena evolutiva de PokeAPI y devuelve una estructura por niveles.
 * 
 * Devuelve { levels, connections } donde:
 * - levels[n] = array de Pokémon en la generación n (0 = base)
 * - connections = [{ from: idParent, to: idChild, details }]
 * 
 * Si se proporciona un formName con sufijo regional (ej: "vulpix-alola"),
 * filtra solo las ramas relevantes y mapea a las variantes regionales.
 */
async function fetchEvolutionChain(evolutionChainUrl, formName) {
    const res = await fetch(evolutionChainUrl);
    if (!res.ok) throw new Error("Error fetching evolution chain");
    const data = await res.json();

    const regionalSuffix = detectRegionalSuffix(formName);

    // 1. Construir árbol con niveles y conexiones
    const levels = [];
    const connections = [];

    function walkTree(node, depth) {
        const id = parseInt(
            node.species.url.split("/").filter(Boolean).pop(),
            10
        );

        // Asegurar que existe el nivel
        if (!levels[depth]) levels[depth] = [];
        levels[depth].push({
            id,
            name: node.species.name,
            details: null, // el detalle se asigna al HIJO, no al padre
        });

        // ── Filtrar ramas para variantes regionales ──
        // Dos pases:
        // 1º: detectar si alguna rama tiene base_form que coincida con la forma actual
        // 2º: si hay coincidencias, excluir ramas sin base_form (genéricas)
        let hasMatchingBaseForm = false;

        if (regionalSuffix) {
            for (const child of node.evolves_to) {
                const childDetails = child.evolution_details?.[0] || null;
                if (childDetails?.base_form?.name === formName) {
                    hasMatchingBaseForm = true;
                    break;
                }
            }
        }

        for (const child of node.evolves_to) {
            const childDetails = child.evolution_details?.[0] || null;

            // Filtrar según la forma regional
            if (regionalSuffix) {
                if (childDetails?.base_form) {
                    // Rama con restricción de forma: solo si coincide con la actual
                    if (childDetails.base_form.name !== formName) continue;
                } else {
                    // Rama genérica (sin base_form): excluir si hay otra rama que ya gestiona esta forma
                    if (hasMatchingBaseForm) continue;
                }
            }

            const childId = parseInt(
                child.species.url.split("/").filter(Boolean).pop(),
                10
            );

            connections.push({
                from: id,
                to: childId,
                details: childDetails ? {
                    trigger: childDetails.trigger?.name || null,
                    minLevel: childDetails.min_level || null,
                    item: childDetails.item?.name || null,
                    itemEs: null,
                } : null,
            });

            walkTree(child, depth + 1);
        }
    }

    walkTree(data.chain, 0);

    // Asignar detalles a cada Pokémon desde las conexiones
    // (cada Pokémon en levels[n>0] tiene su detalle en la connection que llega a él)
    for (const conn of connections) {
        for (let d = 1; d < levels.length; d++) {
            const found = levels[d].find(p => p.id === conn.to);
            if (found) {
                found.details = conn.details;
            }
        }
    }

    // 2. Si estamos viendo variante regional, mapear nombres e ids
    if (regionalSuffix) {
        const allPokemon = levels.flat();
        await Promise.all(allPokemon.map(async (evo) => {
            const variantName = `${evo.name}-${regionalSuffix}`;
            const variantData = await fetchPokemonData(variantName);
            if (variantData) {
                evo.id = variantData.id;
                evo.name = variantData.name;
                evo.isRegional = true;
            }
        }));
    }

    // 3. Traducir nombres de objetos a español
    const allDetails = connections.map(c => c.details).filter(Boolean);
    const itemEntries = allDetails.filter(d => d?.item);
    if (itemEntries.length > 0) {
        const translations = await Promise.all(
            itemEntries.map((d) => fetchItemSpanishName(d.item))
        );
        itemEntries.forEach((d, i) => (d.itemEs = translations[i]));
    }

    return { levels, connections };
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
