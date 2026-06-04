import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pokedex_teams";

function loadTeams() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function emptySlot() {
    return {
        species: null, // { id, name, nameEs, types: [...], sprite }
        ability: null, // { name, nameEs }
        moves: [],     // max 4, cada uno: { name, nameEs, type, power, accuracy, pp, category }
        nature: "serious",
        level: 100,
        shiny: false,
        ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, spe: 31 },
        evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spe: 0 },
    };
}

function createTeam(name) {
    return {
        id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: name || "Nuevo equipo",
        slots: Array.from({ length: 6 }, () => emptySlot()),
    };
}

export function useTeams() {
    const [teams, setTeams] = useState(loadTeams);
    const [activeId, setActiveId] = useState(null);

    // Auto-guardar
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
        } catch {
            // Almacenamiento no disponible o lleno — fallo silencioso
        }
    }, [teams]);

    // Seleccionar primer equipo al cargar
    useEffect(() => {
        if (!activeId && teams.length > 0) setActiveId(teams[0].id);
    }, [teams, activeId]);

    const activeTeam = teams.find((t) => t.id === activeId) || null;

    const addTeam = useCallback(() => {
        const t = createTeam("Equipo " + (teams.length + 1));
        setTeams((prev) => [...prev, t]);
        setActiveId(t.id);
        return t;
    }, [teams.length]);

    const renameTeam = useCallback((id, name) => {
        setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
    }, []);

    const deleteTeam = useCallback((id) => {
        setTeams((prev) => {
            const next = prev.filter((t) => t.id !== id);
            return next;
        });
        setActiveId((prev) => (prev === id ? null : prev));
    }, []);

    const updateSlot = useCallback((teamId, slotIndex, data) => {
        setTeams((prev) =>
            prev.map((t) => {
                if (t.id !== teamId) return t;
                const slots = [...t.slots];
                slots[slotIndex] = { ...slots[slotIndex], ...data };
                return { ...t, slots };
            })
        );
    }, []);

    const clearSlot = useCallback((teamId, slotIndex) => {
        setTeams((prev) =>
            prev.map((t) => {
                if (t.id !== teamId) return t;
                const slots = [...t.slots];
                slots[slotIndex] = emptySlot();
                return { ...t, slots };
            })
        );
    }, []);

    return {
        teams,
        activeTeam,
        activeId,
        setActiveId,
        addTeam,
        renameTeam,
        deleteTeam,
        updateSlot,
        clearSlot,
    };
}
