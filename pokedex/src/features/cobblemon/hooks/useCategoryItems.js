import { useQuery } from "@tanstack/react-query";

/**
 * Controla la concurrencia: ejecuta asyncFns de a N a la vez.
 */
async function batchMap(items, asyncFn, concurrency = 10) {
    const results = [];
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.allSettled(batch.map(asyncFn));
        results.push(...batchResults);
    }
    return results;
}

async function fetchItems(items) {
    const settled = await batchMap(items, async (ref) => {
        const res = await fetch(ref.url);
        if (!res.ok) throw new Error(`Error al obtener ${ref.name}`);
        const data = await res.json();

        const nameEs =
            data.names?.find((n) => n.language.name === "es")?.name ||
            ref.name.charAt(0).toUpperCase() + ref.name.slice(1).replace(/-/g, " ");

        const flavorEs =
            data.flavor_text_entries
                ?.filter((e) => e.language.name === "es")
                .at(-1)
                ?.text?.replace(/[\n\f]/g, " ")
                .replace(/\s+/g, " ")
                .trim() || null;

        const effectEs =
            data.effect_entries
                ?.find((e) => e.language.name === "es")
                ?.effect?.replace(/[\n\f]/g, " ")
                .replace(/\s+/g, " ")
                .trim() || null;

        const shortEffectEs =
            data.effect_entries
                ?.find((e) => e.language.name === "es")
                ?.short_effect?.replace(/[\n\f]/g, " ")
                .replace(/\s+/g, " ")
                .trim() || null;

        const heldBy = (data.held_by_pokemon || []).map((h) => ({
            name: h.pokemon.name,
            url: h.pokemon.url,
        }));

        return {
            id: data.id,
            name: ref.name,
            nameEs,
            sprite: data.sprites?.default || null,
            category: data.category?.name || null,
            cost: data.cost,
            flavorEs,
            effectEs,
            shortEffectEs,
            heldBy,
        };
    }, 10);

    return settled
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value)
        .sort((a, b) => a.id - b.id);
}

export function useCategoryItems(items, categoryKey) {
    return useQuery({
        queryKey: ["categoryItems", categoryKey],
        queryFn: () => fetchItems(items),
        enabled: !!items && items.length > 0,
        staleTime: 1000 * 60 * 30,
    });
}
