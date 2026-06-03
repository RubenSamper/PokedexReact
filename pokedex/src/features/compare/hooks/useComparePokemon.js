import { useQuery } from "@tanstack/react-query";

async function fetchCompareData(name) {
    const [pokeRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${name}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}/`).catch(() => null),
    ]);
    if (!pokeRes.ok) throw new Error(`Error al obtener ${name}`);
    const poke = await pokeRes.json();

    let nameEs = poke.name.charAt(0).toUpperCase() + poke.name.slice(1);
    if (speciesRes?.ok) {
        const species = await speciesRes.json();
        const sn = species.names?.find((n) => n.language.name === "es");
        if (sn) nameEs = sn.name;
    }

    return {
        id: poke.id,
        name: poke.name,
        nameEs,
        types: poke.types.map((t) => t.type.name),
        stats: poke.stats.map((s) => ({
            name: s.stat.name,
            base: s.base_stat,
        })),
        sprite: poke.sprites?.front_default,
        artwork: poke.sprites?.other?.["official-artwork"]?.front_default,
        weight: poke.weight,
        height: poke.height,
    };
}

export function useComparePokemon(name) {
    return useQuery({
        queryKey: ["comparePokemon", name],
        queryFn: () => fetchCompareData(name),
        enabled: !!name,
        staleTime: 1000 * 60 * 30,
    });
}
