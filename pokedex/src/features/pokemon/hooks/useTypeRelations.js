import { useQueries } from "@tanstack/react-query";

async function fetchType(name) {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${name}`);
    if (!res.ok) throw new Error("Error fetching type");
    return res.json();
}

export function useTypeRelations(types) {
    const typeNames = types?.map((t) => (typeof t === "string" ? t : t.type?.name)).filter(Boolean) ?? [];

    const results = useQueries({
        queries: typeNames.map((name) => ({
            queryKey: ["type", name],
            queryFn: () => fetchType(name),
            staleTime: 1000 * 60 * 60,
        })),
    });

    const isLoading = results.some((r) => r.isLoading);
    const isError = results.some((r) => r.isError);

    let weaknesses = [];
    let resistances = [];
    let immunities = [];

    if (!isLoading && !isError && results.length > 0) {
        const multipliers = {};

        for (const result of results) {
            const dr = result.data.damage_relations;

            for (const t of dr.double_damage_from) {
                multipliers[t.name] = (multipliers[t.name] || 1) * 2;
            }
            for (const t of dr.half_damage_from) {
                multipliers[t.name] = (multipliers[t.name] || 1) * 0.5;
            }
            for (const t of dr.no_damage_from) {
                multipliers[t.name] = 0;
            }
        }

        for (const [type, mult] of Object.entries(multipliers)) {
            if (mult === 0) immunities.push(type);
            else if (mult > 1) weaknesses.push({ type, multiplier: mult });
            else if (mult < 1) resistances.push({ type, multiplier: mult });
        }

        weaknesses.sort((a, b) => b.multiplier - a.multiplier);
        resistances.sort((a, b) => a.multiplier - b.multiplier);
    }

    return { weaknesses, resistances, immunities, isLoading, isError };
}
