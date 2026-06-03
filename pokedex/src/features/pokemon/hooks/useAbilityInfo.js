import { useQueries } from "@tanstack/react-query";

async function fetchAbility(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching ability");
    const data = await res.json();

    const nameEs = data.names?.find((n) => n.language.name === "es")?.name
        ?? data.name.charAt(0).toUpperCase() + data.name.slice(1);

    const flavorEs = data.flavor_text_entries
        ?.find((e) => e.language.name === "es")
        ?.flavor_text
        ?.replace(/[\n\f]/g, " ")
        ?? "No hay descripción disponible en español.";

    return { name: nameEs, description: flavorEs };
}

export function useAbilityInfo(abilities) {
    const urls = abilities?.map((a) => a.ability?.url).filter(Boolean) ?? [];

    const results = useQueries({
        queries: urls.map((url) => ({
            queryKey: ["ability", url],
            queryFn: () => fetchAbility(url),
            staleTime: 1000 * 60 * 60,
        })),
    });

    return results.map((r) => ({
        data: r.data ?? null,
        isLoading: r.isLoading,
        isError: r.isError,
    }));
}
