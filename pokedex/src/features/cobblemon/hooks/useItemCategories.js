import { useQuery } from "@tanstack/react-query";

const CATEGORIES_URL = "https://pokeapi.co/api/v2/item-category/?limit=100";

// Solo las categorías que el usuario quiere ver
const WHITELIST = new Set([
    "type-enhancement",     // Potenciadores de tipo
    "plates",               // Platos Arceus
    "held-items",           // Objetos competitivos + clima
    "choice",               // Objetos competitivos
    "evolution",            // Evolutivos
    "effort-training",      // Esfuerzo (Power items)
    "vitamins",             // Vitaminas (esfuerzo)
    "effort-drop",          // Bayas reductoras de esfuerzo
    "medicine",             // Bayas curativas
    "in-a-pinch",           // Bayas de apuro
    "picky-healing",        // Bayas selectivas
    "healing",              // Pociones
    "pp-recovery",          // Recuperación de PP
    "revival",              // Revivir
    "status-cures",         // Cura de estado
    "nature-mints",         // Mintas de naturaleza
    "all-machines",         // MTs/MOs
    "jewels",               // Joyas
    "apricorn-balls",       // Bonguri
    "standard-balls",       // Pokéballs estándar
    "special-balls",        // Pokéballs especiales
    "flutes",               // Flautas
]);

const CATEGORY_ES = {
    "type-enhancement": "Potenciadores de tipo",
    "plates": "Platos Arceus",
    "held-items": "Objetos competitivos y de clima",
    "choice": "Objetos de elección",
    "evolution": "Objetos evolutivos",
    "effort-training": "Entrenamiento de esfuerzo",
    "vitamins": "Vitaminas",
    "effort-drop": "Bayas reductoras de esfuerzo",
    "medicine": "Bayas curativas",
    "in-a-pinch": "Bayas de apuro",
    "picky-healing": "Bayas de curación selectiva",
    "healing": "Pociones",
    "pp-recovery": "Recuperación de PP",
    "revival": "Revivir",
    "status-cures": "Cura de estado",
    "nature-mints": "Mintas de naturaleza",
    "all-machines": "MT/MO",
    "jewels": "Joyas",
    "apricorn-balls": "Poké Balls Bonguri",
    "standard-balls": "Poké Balls estándar",
    "special-balls": "Poké Balls especiales",
    "flutes": "Flautas",
};

/**
 * Controla la concurrencia: ejecuta asyncFns de a N a la vez.
 */
async function batchMap(items, asyncFn, concurrency = 5) {
    const results = [];
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.allSettled(batch.map(asyncFn));
        results.push(...batchResults);
    }
    return results;
}

async function fetchWhitelistedCategories() {
    // 1) Obtener lista de categorías
    const listRes = await fetch(CATEGORIES_URL);
    if (!listRes.ok) throw new Error("Error al obtener categorías");
    const listData = await listRes.json();

    // 2) Filtrar solo las whitelisted
    const wanted = listData.results.filter((cat) => WHITELIST.has(cat.name));

    // 3) Fetch detalle en lotes de 5
    const settled = await batchMap(wanted, async (cat) => {
        const res = await fetch(cat.url);
        if (!res.ok) throw new Error(`Error al obtener categoría ${cat.name}`);
        const data = await res.json();
        return {
            id: data.id,
            name: cat.name,
            nameEs: CATEGORY_ES[cat.name] || cat.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            itemCount: data.items.length,
            items: data.items,
            pocket: data.pocket?.name || null,
        };
    }, 5);

    return settled
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value)
        .sort((a, b) => a.id - b.id);
}

export function useItemCategories() {
    return useQuery({
        queryKey: ["itemCategories", "whitelisted"],
        queryFn: fetchWhitelistedCategories,
        staleTime: 1000 * 60 * 60,
    });
}
