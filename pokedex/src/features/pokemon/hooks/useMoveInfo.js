import { useState, useCallback } from "react";

export function useMoveInfo() {
    const [moveCache, setMoveCache] = useState({});

    const fetchMove = useCallback(async (url) => {
        if (moveCache[url]) return moveCache[url];

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error fetching move");
        const data = await res.json();

        const nameEs = data.names?.find((n) => n.language.name === "es")?.name
            ?? data.name.charAt(0).toUpperCase() + data.name.slice(1);

        const flavorEs = data.flavor_text_entries
            ?.find((e) => e.language.name === "es")
            ?.flavor_text
            ?.replace(/[\n\f]/g, " ")
            ?? "No hay descripción disponible en español.";

        const type = data.type?.name ?? "unknown";
        const power = data.power ?? "—";
        const pp = data.pp ?? "—";
        const accuracy = data.accuracy ?? "—";
        const category = data.damage_class?.name ?? "—";

        const info = { name: nameEs, description: flavorEs, type, power, pp, accuracy, category };

        setMoveCache((prev) => ({ ...prev, [url]: info }));
        return info;
    }, [moveCache]);

    return { fetchMove, moveCache };
}
