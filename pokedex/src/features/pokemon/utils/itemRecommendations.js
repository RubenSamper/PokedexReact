/**
 * Motor de recomendaciones de objetos para combate competitivo.
 *
 * Analiza las estadísticas base y tipos de cualquier Pokémon y genera
 * recomendaciones dinámicas sin necesidad de datos curados manualmente.
 *
 * También permite cargar datos curados específicos para ciertos Pokémon
 * (como mega piedras o builds muy concretos) que están en recommendedItems.js.
 */

// ─── Tipos con debilidad a Stealth Rock ────────────────────────────────────
// Stealth Rock calcula el daño según la efectividad de Roca contra el Pokémon.
const WEAK_TO_ROCK = new Set(["fire", "flying", "ice", "bug"]);

// ─── Tipo Veneno: el Lodo Negro reemplaza a Restos ─────────────────────────
const POISON_TYPE = "poison";

// ─── Umbrales de stats ─────────────────────────────────────────────────────
const HIGH_ATK = 100;
const HIGH_SPA = 100;
const HIGH_SPE = 85;
const VERY_HIGH_SPE = 115;
const BULKY_THRESHOLD = 320;
const FRAIL_THRESHOLD = 210;
const OFFENSIVE_THRESHOLD = 20;

// ─── Objetos universales y su explicación genérica ─────────────────────────
const ITEM_INFO = {
    "heavy-duty-boots": {
        itemEs: "Botas Recias",
        baseReason:
            "Protege de Stealth Rock, permitiendo entrar y salir sin recibir daño de entrada.",
    },
    leftovers: {
        itemEs: "Restos",
        baseReason:
            "Recupera un 6.25% de PV cada turno. Ideal para alargar su presencia en combate.",
    },
    "life-orb": {
        itemEs: "Vida Esfera",
        baseReason:
            "Aumenta un 30% todo el daño infligido a cambio de algo de PV. Perfecto para sets ofensivos.",
    },
    "choice-band": {
        itemEs: "Cinta Elegir",
        baseReason:
            "Potencia los ataques físicos un 50%. Puede salir y volver a entrar para cambiar de movimiento.",
    },
    "choice-specs": {
        itemEs: "Gafas Elegir",
        baseReason:
            "Potencia los ataques especiales un 50%. Ideal para hacer un daño masivo desde el primer turno.",
    },
    "choice-scarf": {
        itemEs: "Pañuelo Elegir",
        baseReason:
            "Multiplica la velocidad por 1.5. Le permite superar a rivales más rápidos y golpear primero.",
    },
    "focus-sash": {
        itemEs: "Banda Focus",
        baseReason:
            "Aguanta un golpe letal con 1 de PV. Asegura poder moverse al menos una vez.",
    },
    "assault-vest": {
        itemEs: "Chaleco Asalto",
        baseReason:
            "Sube la Defensa Especial un 50%, pero solo permite usar movimientos de ataque.",
    },
    "rocky-helmet": {
        itemEs: "Casco Dentado",
        baseReason:
            "Castiga a los atacantes físicos quitándoles un 16.67% de PV al golpear.",
    },
    "air-balloon": {
        itemEs: "Globo Helio",
        baseReason:
            "Otorga inmunidad a movimientos de tipo Tierra mientras el globo esté intacto.",
    },
    "expert-belt": {
        itemEs: "Cinta Fuerte",
        baseReason:
            "Potencia un 20% los movimientos supereficaces. Bueno para Pokémon con buena cobertura de tipos.",
    },
    "black-sludge": {
        itemEs: "Lodo Negro",
        baseReason:
            "Versión de Restos para tipo Veneno: recupera PV cada turno. Daña a otros tipos.",
    },
};

/**
 * Extrae los nombres de tipo de un Pokémon desde el formato de PokeAPI.
 */
function extractTypes(types) {
    return types.map((t) => t.type?.name || t.name || t);
}

/**
 * Convierte el array de stats en un objeto { nombre: valor }.
 */
function extractStats(stats) {
    const map = {};
    for (const s of stats) {
        const name = s.stat?.name || s.name;
        const value = s.base_stat ?? s.base ?? s.value ?? 0;
        map[name] = value;
    }
    return map;
}

/**
 * Comprueba si el Pokémon tiene 2× o 4× debilidad a Roca (Stealth Rock).
 */
function isWeakToRock(typeNames) {
    return typeNames.some((t) => WEAK_TO_ROCK.has(t));
}

/**
 * Determina si un tipo está presente en la lista de tipos del Pokémon.
 */
function hasType(typeNames, target) {
    return typeNames.includes(target);
}

/**
 * Genera recomendaciones dinámicas para cualquier Pokémon basándose en
 * sus tipos y estadísticas base.
 *
 * @param {string[]} typeNames - Lista de tipos (ej: ["fire", "flying"])
 * @param {object} statMap - Mapa de stats { hp, attack, defense, special-attack, special-defense, speed }
 * @param {number} maxItems - Máximo de items a recomendar (default 5)
 * @returns {Array<{item: string, itemEs: string, reason: string}>}
 */
export function generateRecommendations(typeNames, statMap, maxItems = 5) {
    const { hp, attack, defense, "special-attack": spa, "special-defense": spd, speed } = statMap;

    const isPhysical = attack >= spa && (attack - spa) >= OFFENSIVE_THRESHOLD;
    const isSpecial = spa > attack && (spa - attack) >= OFFENSIVE_THRESHOLD;
    const isFast = speed >= HIGH_SPE;
    const isVeryFast = speed >= VERY_HIGH_SPE;
    const bulk = hp + defense + spd;
    const isBulky = bulk >= BULKY_THRESHOLD;
    const isFrail = bulk <= FRAIL_THRESHOLD;
    const weakRock = isWeakToRock(typeNames);
    const isPoison = hasType(typeNames, POISON_TYPE);

    // Inmunidad natural a Tierra por tipo
    const groundImmuneType = hasType(typeNames, "flying");

    const results = [];

    // ─── 1. Heavy-Duty Boots (si es débil a Stealth Rock) ────────────────
    if (weakRock) {
        const typeStr = typeNames.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join("/");
        results.push({
            item: "heavy-duty-boots",
            itemEs: ITEM_INFO["heavy-duty-boots"].itemEs,
            reason: `${typeStr} es débil a Stealth Rock. ${ITEM_INFO["heavy-duty-boots"].baseReason} Especialmente importante para este Pokémon.`,
        });
    }

    // ─── 2. Leftovers / Black Sludge (recuperación universal) ─────────────
    // Se recomienda para casi todos excepto los ultra-frágiles
    if (!isFrail || isBulky) {
        if (isPoison) {
            results.push({
                item: "black-sludge",
                itemEs: ITEM_INFO["black-sludge"].itemEs,
                reason: `Tipo Veneno. ${ITEM_INFO["black-sludge"].baseReason}`,
            });
        } else {
            const reason = isBulky
                ? `Su buena defensa general (${hp} PS, ${defense} Def, ${spd} Def. Esp) se beneficia de la recuperación pasiva.`
                : ITEM_INFO["leftovers"].baseReason;
            results.push({
                item: "leftovers",
                itemEs: ITEM_INFO["leftovers"].itemEs,
                reason: `${ITEM_INFO["leftovers"].baseReason} ${reason}`,
            });
        }
    }

    // ─── 3. Choice Band (físico fuerte) ──────────────────────────────────
    if (attack >= HIGH_ATK && !isSpecial) {
        results.push({
            item: "choice-band",
            itemEs: ITEM_INFO["choice-band"].itemEs,
            reason: `Su Ataque base de ${attack} es excelente. ${ITEM_INFO["choice-band"].baseReason}`,
        });
    }

    // ─── 4. Choice Specs (especial fuerte) ───────────────────────────────
    if (spa >= HIGH_SPA && !isPhysical) {
        results.push({
            item: "choice-specs",
            itemEs: ITEM_INFO["choice-specs"].itemEs,
            reason: `Su Sp. Atk base de ${spa} es excelente. ${ITEM_INFO["choice-specs"].baseReason}`,
        });
    }

    // ─── 5. Life Orb (ofensivo versátil) ─────────────────────────────────
    const hasDecentOffense = attack >= 80 || spa >= 80;
    if (hasDecentOffense) {
        const focus = isPhysical ? `Ataque (${attack})` : isSpecial ? `Sp. Atk (${spa})` : `Ataque (${attack}) y Sp. Atk (${spa}) equilibrados`;
        results.push({
            item: "life-orb",
            itemEs: ITEM_INFO["life-orb"].itemEs,
            reason: `Potencia su ${focus} un 30%. ${ITEM_INFO["life-orb"].baseReason}`,
        });
    }

    // ─── 6. Choice Scarf (para compensar o potenciar velocidad) ──────────
    if (speed >= HIGH_SPE && hasDecentOffense) {
        results.push({
            item: "choice-scarf",
            itemEs: ITEM_INFO["choice-scarf"].itemEs,
            reason: `Su velocidad base de ${speed} es buena. Con el Pañuelo supera a la mayoría de rivales y golpea primero.`,
        });
    } else if (speed >= 60 && speed < HIGH_SPE && hasDecentOffense) {
        results.push({
            item: "choice-scarf",
            itemEs: ITEM_INFO["choice-scarf"].itemEs,
            reason: `Su velocidad de ${speed} es decente pero no suficiente. ${ITEM_INFO["choice-scarf"].baseReason}`,
        });
    }

    // ─── 7. Focus Sash (frágil, sobre todo si es rápido) ─────────────────
    if (isFrail) {
        const speedNote = isFast ? "Es rápido pero frágil" : `Es muy frágil (${bulk} de bulk total)`;
        results.push({
            item: "focus-sash",
            itemEs: ITEM_INFO["focus-sash"].itemEs,
            reason: `${speedNote}. ${ITEM_INFO["focus-sash"].baseReason}`,
        });
    }

    // ─── 8. Assault Vest (bulky especial) ────────────────────────────────
    if (isBulky && (spd >= 80 || defense >= 100)) {
        const focus = spd >= defense ? "Defensa Especial" : "Defensa";
        results.push({
            item: "assault-vest",
            itemEs: ITEM_INFO["assault-vest"].itemEs,
            reason: `Su ${focus} base es buena. ${ITEM_INFO["assault-vest"].baseReason}`,
        });
    }

    // ─── 9. Rocky Helmet (defensa física) ────────────────────────────────
    if (defense >= 90 && !isFrail) {
        results.push({
            item: "rocky-helmet",
            itemEs: ITEM_INFO["rocky-helmet"].itemEs,
            reason: `Su Defensa física de ${defense} lo prepara para recibir golpes. ${ITEM_INFO["rocky-helmet"].baseReason}`,
        });
    }

    // ─── 10. Air Balloon (si no tiene inmunidad natural a Tierra) ────────
    if (!groundImmuneType && defense >= 60 && !isFrail) {
        results.push({
            item: "air-balloon",
            itemEs: ITEM_INFO["air-balloon"].itemEs,
            reason: `Otorga inmunidad a Terremoto. ${ITEM_INFO["air-balloon"].baseReason}`,
        });
    }

    // ─── 11. Expert Belt (cobertura, si faltan opciones ofensivas) ───────
    if (results.length < maxItems && hasDecentOffense) {
        results.push({
            item: "expert-belt",
            itemEs: ITEM_INFO["expert-belt"].itemEs,
            reason: `Buena cobertura de tipos. ${ITEM_INFO["expert-belt"].baseReason}`,
        });
    }

    // ─── 12. FALLBACK UNIVERSAL ───────────────────────────────────────────
    // Si aún así no hay suficientes items, añadir opciones genéricas
    const hasLeftovers = results.some(r => r.item === "leftovers" || r.item === "black-sludge");
    if (results.length < Math.min(maxItems, 3) && !hasLeftovers) {
        results.push({
            item: "leftovers",
            itemEs: ITEM_INFO["leftovers"].itemEs,
            reason: ITEM_INFO["leftovers"].baseReason,
        });
    }

    const hasFocus = results.some(r => r.item === "focus-sash");
    if (results.length < Math.min(maxItems, 3) && !hasFocus && isFrail) {
        results.push({
            item: "focus-sash",
            itemEs: ITEM_INFO["focus-sash"].itemEs,
            reason: `${ITEM_INFO["focus-sash"].baseReason}`,
        });
    }

    return results.slice(0, maxItems);
}

/**
 * Combina datos curados (recomendaciones específicas) con las generadas
 * dinámicamente. Si existen datos curados completos, se usan esos.
 * Las mega-piedras se añaden siempre si corresponden al Pokémon.
 *
 * @param {string} pokemonName - Nombre del Pokémon
 * @param {Array} types - Tipos del Pokémon (formato PokeAPI)
 * @param {Array} stats - Estadísticas base (formato PokeAPI)
 * @param {Function} getCurated - Función para obtener datos curados
 * @param {number} maxItems - Máximo de items
 * @returns {Array<{item, itemEs, reason}>}
 */
export function getItemRecommendations(pokemonName, types, stats, getCurated, maxItems = 0) {
    const name = pokemonName?.toLowerCase();
    let result = [];

    // 1. Obtener datos curados (si existen)
    let curated = [];
    if (typeof getCurated === "function") {
        curated = getCurated(pokemonName) || [];
    }

    // 2. Obtener la mega-piedra del Pokémon (si tiene)
    const megaStone = getMegaStone(name);
    const hasMegaInCurated = curated.some((c) => c.item === megaStone?.item);

    // 3. Si hay datos curados completos (y ya incluye la mega si la tiene)
    if (curated.length > 0) {
        if (megaStone && !hasMegaInCurated) {
            // Añadir mega-piedra al principio si no está ya en curados
            curated = [megaStone, ...curated];
        }
        return maxItems > 0 ? curated.slice(0, maxItems) : curated;
    }

    // 4. Generar recomendaciones dinámicas
    if (!types || !stats) return megaStone ? [megaStone] : null;

    const typeNames = extractTypes(types);
    const statMap = extractStats(stats);
    if (typeNames.length === 0 || Object.keys(statMap).length === 0) {
        return megaStone ? [megaStone] : null;
    }

    const genCount = maxItems > 0 ? maxItems - (megaStone ? 1 : 0) : 6;
    result = generateRecommendations(typeNames, statMap, genCount);

    // 5. Si tiene mega-piedra, añadirla al principio
    if (megaStone) {
        result = [megaStone, ...result];
    }

    return maxItems > 0 ? result.slice(0, maxItems) : result;
}

// ─── Mega Piedras ───────────────────────────────────────────────────────────
// Mapa de todos los Pokémon que pueden mega-evolucionar.
// La explicación detalla el cambio de tipo, talento y mejora principal.

const _MEGA_REASONS = {
    charizard: "Mega-Charizard X se vuelve Fuego/Dragón con 'Garra Dura' y Ataque 130. Mega-Charizard Y obtiene 'Sequía' y Sp. Atk 159. Ambas son opciones viables según el set.",
    venusaur: "Mega-Venusaur gorda el talento 'Sebo' (reduce daño de Fuego y Hielo) y sube todas sus stats defensivas. Se convierte en un muro temible con Síntesis y Drenadoras.",
    blastoise: "Mega-Blastoise obtiene 'Lanzamisiles', que potencia sus ataques de pulso como Pulso Agua, Puño Fuego o Pulso Sombra. Su Sp. Atk sube a 135.",
    beedrill: "Mega-Beedrill sube su Ataque a 150 y velocidad a 145, y obtiene 'Adaptabilidad', potenciando sus movimientos de tipo Bicho y Veneno STAB a 2×.",
    pidgeot: "Mega-Pidgeot obtiene 'Ojo de Halcón', que hace que sus movimientos nunca fallen. Combínalo con Vendaval o Ataque Rápido.",
    alakazam: "Mega-Alakazam sube su Sp. Atk a 175 y velocidad a 150, y obtiene 'Rastro' para copiar talentos rivales. Frágil pero devastador.",
    slowbro: "Mega-Slowbro obtiene 'Armadura Batalla', evitando golpes críticos. Sube su Defensa a 180, convirtiéndolo en un muro físico extremo.",
    gengar: "Mega-Gengar obtiene 'Sombra Trampa', atrapando al rival y evitando que cambie. Su Sp. Atk de 170 y velocidad de 130 lo hacen letal.",
    kangaskhan: "Mega-Kangaskhan obtiene 'Amor Filial', que golpea dos veces por turno. Duplica el daño de movimientos como Golpe Cuerpo o Terremoto.",
    pinsir: "Mega-Pinsir obtiene 'Piel Celeste', convirtiendo sus movimientos Normales en Voladores. Potencia Vuelo o Giro rápido con STAB de Volador.",
    gyarados: "Mega-Gyarados obtiene 'Romper Moldes' (ignora talentos) y su Ataque sube a 155. Sigue siendo 4× débil a Eléctrico pero es un físico temible.",
    aerodactyl: "Mega-Aerodactyl sube su velocidad a 150 y obtiene 'Garra Dura', potenciando movimientos de contacto. Ideal como revenge killer.",
    mewtwo: "Mega-Mewtwo X es Físico/Psíquico con 'Impacible' (sube Velocidad al fallar). Mega-Mewtwo Y sube su Sp. Atk a 194, el más alto del juego.",
    ampharos: "Mega-Ampharos se vuelve Eléctrico/Dragón y obtiene 'Romper Moldes'. Su Sp. Atk de 165 y buena cobertura lo hacen muy ofensivo.",
    steelix: "Mega-Steelix sube su Defensa a 230, la más alta del juego. Obtiene 'Ímpetu Arena' para potenciar ataques de Roca, Tierra y Acero.",
    scizor: "Mega-Scizor sube su Ataque a 150 y obtiene 'Técnico', potenciando movimientos de 60 o menos de potencia. Cuchillada + Técnico es devastador.",
    heracross: "Mega-Heracross sube su Ataque a 185 y obtiene 'Encadenado', que convierte movimientos de 2-5 golpes en siempre 5. Perforador es letal.",
    houndoom: "Mega-Houndoom obtiene 'Poder Solar', potenciando sus ataques de Fuego bajo sol. Ideal en equipos de clima soleado.",
    tyranitar: "Mega-Tyranitar sube su Ataque a 164 y su Defensa a 150. Mantiene 'Chorro Arena', potenciando su Sp. Def y desgastando al rival.",
    sceptile: "Mega-Sceptile obtiene 'Foco Rayo' (inmunidad a Eléctrico + sube Sp. Atk al recibir daño). Se vuelve Planta/Dragón con Sp. Atk de 145.",
    blaziken: "Mega-Blaziken obtiene 'Impulso' (sube Velocidad cada turno). Su Ataque de 160 y velocidad creciente lo convierten en un sweep imparable.",
    swampert: "Mega-Swampert obtiene 'Nado Rápido', duplicando velocidad bajo lluvia. Su Ataque de 150 y buena defensa lo hacen dominante en equipos de lluvia.",
    gardevoir: "Mega-Gardevoir obtiene 'Piel Feérica', convirtiendo ataques Normales en Hada. Su Sp. Atk de 165 con Voz Cautivadora STAB es brutal.",
    sableye: "Mega-Sableye obtiene 'Espejo Mágico', reflejando movimientos de estado. Sus defensas suben mucho y puede desgastar con Toxic+Protección.",
    mawile: "Mega-Mawile obtiene 'Potencia' (duplica el Ataque). Su Ataque efectivo supera cualquier límite. Puño Meteoro STAB + Potencia es devastador.",
    aggron: "Mega-Aggron obtiene 'Filtro', reduciendo daño supereficaz. Su Defensa sube a 230, la más alta junto a Steelix. Muro físico absoluto.",
    medicham: "Mega-Medicham obtiene 'Potencia Pura' (duplica el Ataque). Su Ataque efectivo es inmenso. Ideal para sets de cuatro ataques físicos.",
    manectric: "Mega-Manectric obtiene 'Intimidación', bajando el Ataque rival al entrar. Su velocidad de 135 y Sp. Atk de 135 lo hacen rápido y potente.",
    sharpedo: "Mega-Sharpedo obtiene 'Mandíbula Fuerte', potenciando ataques de mordisco. Su velocidad sube a 140 y su Ataque a 140. Mordisco temible.",
    camerupt: "Mega-Camerupt obtiene 'Ímpetu Arena', potenciando sus ataques. Su Sp. Atk de 145 y buena defensa lo hacen un tanque especial ofensivo.",
    altaria: "Mega-Altaria obtiene 'Piel Feérica' y se vuelve Dragón/Hada. Voz Cautivadora STAB es increíble. Buenas defensas y recuperación con Descanso.",
    banette: "Mega-Banette obtiene 'Bromista', dando prioridad a movimientos de estado. Puede colocar maldiciones, pantallas o lastres antes de caer.",
    absol: "Mega-Absol obtiene 'Espejo Mágico', reflejando movimientos de estado. Su Ataque de 150 es excelente para sets ofensivos de cobertura.",
    glalie: "Mega-Glalie obtiene 'Piel Helada', convirtiendo ataques Normales en Hielo. Su Ataque de 120 le permite usar Ventisca o Rayo Hielo con STAB.",
    salamence: "Mega-Salamence obtiene 'Piel Celeste', convirtiendo ataques Normales en Volador. Su Ataque de 145 con Doble Filo Volador es temible.",
    metagross: "Mega-Metagross obtiene 'Garra Dura', potenciando movimientos de contacto. Su Ataque de 145 y defensa de 150 lo hacen ofensivo y tanque.",
    latias: "Mega-Latias sube su Sp. Def a 150, convirtiéndola en un muro especial. Mantiene 'Levitación' y puede apoyar con Recuperación y Pantallas.",
    latios: "Mega-Latios sube su Sp. Atk a 160 y velocidad a 130. Con 'Levitación' y buena cobertura, es un special sweeper de primer nivel.",
    lopunny: "Mega-Lopunny obtiene 'Audaz' (golpea a Fantasmas con Normales/Lucha). Su velocidad de 135 y Ataque de 136 la hacen rápida y potente.",
    garchomp: "Mega-Garchomp sube su Ataque a 170 y su Sp. Atk a 120. Obtiene 'Ímpetu Arena'. Su velocidad baja a 92 pero su poder ofensivo es brutal.",
    lucario: "Mega-Lucario obtiene 'Adaptabilidad', potenciando STAB a 2×. Su Ataque de 145 y Sp. Atk de 140 permiten sets mixtos devastadores.",
    abomasnow: "Mega-Abomasnow obtiene 'Nevada', invocando granizo. Su Ataque de 132 y Sp. Atk de 132 son equilibrados. Bueno en equipos de granizo.",
    gallade: "Mega-Gallade obtiene 'Foco Interno' (no retrocede) y sube su Ataque a 165. Ideal para sets de cobertura física con Puño Sombra y Corte.",
    audino: "Mega-Audino obtiene 'Alma Cura', curando estados al entrar. Sube todas las defensas y PS, convirtiéndola en un cleric de apoyo puro.",
    diancie: "Mega-Diancie obtiene 'Espejo Mágico'. Su Ataque y Sp. Atk suben a 160 cada uno. Puede atacar por ambos lados con buena cobertura.",
};

const MEGA_STONES = {};

// Generar el mapa de mega piedras automáticamente
function _buildMegaStones() {
    const stones = {
        venusaur: "venusaurite", blastoise: "blastoisinite", beedrill: "beedrillite",
        pidgeot: "pidgeotite", alakazam: "alakazite", slowbro: "slowbronite",
        gengar: "gengarite", kangaskhan: "kangaskhanite", pinsir: "pinsirite",
        gyarados: "gyaradosite", aerodactyl: "aerodactylite",
        ampharos: "ampharosite", steelix: "steelixite", scizor: "scizorite",
        heracross: "heracronite", houndoom: "houndoominite", tyranitar: "tyranitarite",
        sceptile: "sceptilite", blaziken: "blazikenite", swampert: "swampertite",
        gardevoir: "gardevoirite", sableye: "sablenite", mawile: "mawilite",
        aggron: "aggronite", medicham: "medichamite", manectric: "manectite",
        sharpedo: "sharpedonite", camerupt: "cameruptite", altaria: "altarianite",
        banette: "banettite", absol: "absolite", glalie: "glalitite",
        salamence: "salamencite", metagross: "metagrossite",
        latias: "latiasite", latios: "latiosite",
        lopunny: "lopunnite", garchomp: "garchompite", lucario: "lucarionite",
        abomasnow: "abomasite", gallade: "galladite", audino: "audinite",
        diancie: "diancite",
        // Casos con dos variantes: usamos la variante X por defecto
        charizard: "charizardite-x",
        mewtwo: "mewtwonite-x",
    };

    const esNames = {
        venusaurite: "Venusaurita", blastoisinite: "Blastoisita",
        beedrillite: "Beedrillita", pidgeotite: "Pidgeotita",
        alakazite: "Alakazamita", slowbronite: "Slowbronita",
        gengarite: "Gengarita", kangaskhanite: "Kangaskhanita",
        pinsirite: "Pinsirita", gyaradosite: "Gyaradosita",
        aerodactylite: "Aerodactylita",
        ampharosite: "Ampharosita", steelixite: "Steelixita",
        scizorite: "Scizorita", heracronite: "Heracrossita",
        houndoominite: "Houndoomita", tyranitarite: "Tyranitarita",
        sceptilite: "Sceptilita", blazikenite: "Blazikenita",
        swampertite: "Swampertita", gardevoirite: "Gardevoirita",
        sablenite: "Sableynita", mawilite: "Mawilita",
        aggronite: "Aggronita", medichamite: "Medichamita",
        manectite: "Manectricita", sharpedonite: "Sharpedonita",
        cameruptite: "Cameruptita", altarianite: "Altarianita",
        banettite: "Banettita", absolite: "Absolita",
        glalitite: "Glalita", salamencite: "Salamencita",
        metagrossite: "Metagrossita",
        latiasite: "Latiasita", latiosite: "Latiosita",
        lopunnite: "Lopunnita", garchompite: "Garchompita",
        lucarionite: "Lucarita", abomasite: "Abomasnowita",
        galladite: "Galladita", audinite: "Audinita",
        diancite: "Diancita",
        // Variantes X/Y
        "charizardite-x": "Charizardita X",
        "charizardite-y": "Charizardita Y",
        "mewtwonite-x": "Mewtwoita X",
        "mewtwonite-y": "Mewtwoita Y",
    };

    for (const [pokemon, item] of Object.entries(stones)) {
        const reason = _MEGA_REASONS[pokemon];
        if (reason) {
            MEGA_STONES[pokemon] = {
                item,
                itemEs: esNames[item] || item,
                reason,
            };
        }
    }

    // Casos especiales con dos mega-piedras
    MEGA_STONES["charizard-x"] = {
        item: "charizardite-x",
        itemEs: "Charizardita X",
        reason: "Mega-Evoluciona a Charizard X (Fuego/Dragón), subiendo su Ataque a 130 y obteniendo 'Garra Dura' que potencia los movimientos de contacto. Ideal para sets físicos.",
    };
    MEGA_STONES["charizard-y"] = {
        item: "charizardite-y",
        itemEs: "Charizardita Y",
        reason: "Mega-Evoluciona a Charizard Y (Fuego/Volador), con Sp. Atk de 159 y 'Sequía' que invoca sol intenso. Sus movimientos de Fuego se vuelven devastadores.",
    };
    MEGA_STONES["mewtwo-x"] = {
        item: "mewtwonite-x",
        itemEs: "Mewtwoita X",
        reason: "Mega-Mewtwo X se vuelve Psíquico/Lucha con Ataque de 190. Obtiene 'Impacible' y puede barrer físicamente con Puño Sombra y Terremoto.",
    };
    MEGA_STONES["mewtwo-y"] = {
        item: "mewtwonite-y",
        itemEs: "Mewtwoita Y",
        reason: "Mega-Mewtwo Y tiene el Sp. Atk más alto del juego (194). Obtiene 'Insomnio' y su Psíquico STAB destruye prácticamente todo.",
    };
}

_buildMegaStones();

/**
 * Obtiene la mega-piedra recomendada para un Pokémon, si tiene.
 * Maneja nombres con variante: "charizard-mega-x" → "charizardite-x"
 */
function getMegaStone(pokemonName) {
    if (!pokemonName) return null;

    // Caso directo (ej: "charizard" → ya en MEGA_STONES como entrada especial)
    // Los casos MEGA_STONES con claves como "charizard-x" o "mewtwo-x" se usan
    // cuando el nombre viene con la variante

    // Primero intentar coincidencia exacta (ej: "charizard")
    let stone = MEGA_STONES[pokemonName];
    if (stone) return stone;

    // Detectar formas mega: "charizard-mega-x" → "charizard-x"
    const megaMatch = pokemonName.match(/^(.+)-mega(?:-(.+))?$/);
    if (megaMatch) {
        const base = megaMatch[1];
        const variant = megaMatch[2];

        // Intentar con variante: "charizard-x"
        if (variant) {
            const key = `${base}-${variant}`;
            stone = MEGA_STONES[key];
            if (stone) return stone;
        }

        // Intentar solo el base: "charizard"
        stone = MEGA_STONES[base];
        if (stone) return stone;
    }

    return null;
}
