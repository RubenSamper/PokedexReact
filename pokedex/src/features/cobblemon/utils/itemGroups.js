/**
 * Grupos de objetos según la organización que pidió el usuario.
 * Cada grupo agrupa una o más categorías de PokeAPI.
 */
export const ITEM_GROUPS = [
    {
        slug: "potenciadores",
        name: "Potenciadores de tipo",
        categories: ["type-enhancement"],
    },
    {
        slug: "platos",
        name: "Platos Arceus",
        categories: ["plates"],
    },
    {
        slug: "competitivos",
        name: "Objetos competitivos",
        categories: ["held-items", "choice"],
    },
    {
        slug: "evolutivos",
        name: "Objetos evolutivos",
        categories: ["evolution"],
    },
    {
        slug: "esfuerzo",
        name: "Objetos de esfuerzo",
        categories: ["effort-training", "vitamins", "effort-drop"],
    },
    {
        slug: "bayas",
        name: "Bayas",
        categories: ["medicine", "in-a-pinch", "picky-healing"],
    },
    {
        slug: "pociones",
        name: "Pociones",
        categories: ["healing", "pp-recovery", "revival", "status-cures"],
    },
    {
        slug: "mentas",
        name: "Mintas de naturaleza",
        categories: ["nature-mints"],
    },
    {
        slug: "mts",
        name: "MT/MO",
        categories: ["all-machines"],
    },
    {
        slug: "joyas",
        name: "Joyas",
        categories: ["jewels"],
    },
    {
        slug: "bonguri",
        name: "Poké Balls Bonguri",
        categories: ["apricorn-balls"],
    },
    {
        slug: "pokeballs-standard",
        name: "Poké Balls estándar",
        categories: ["standard-balls"],
    },
    {
        slug: "pokeballs-special",
        name: "Poké Balls especiales",
        categories: ["special-balls"],
    },
    {
        slug: "flautas",
        name: "Flautas",
        categories: ["flutes"],
    },
];

/** Busca un grupo por su slug */
export function getGroupBySlug(slug) {
    return ITEM_GROUPS.find((g) => g.slug === slug) || null;
}
