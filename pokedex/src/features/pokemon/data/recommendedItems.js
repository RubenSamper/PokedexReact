/**
 * Items recomendados para cada Pokémon en combate competitivo.
 *
 * Cada entrada contiene:
 *   - item:        nombre del item en inglés (según PokeAPI)
 *   - itemEs:      nombre en español
 *   - reason:      explicación de por qué es bueno para ese Pokémon
 *
 * Los items aparecen ordenados por prioridad (de más a menos recomendado).
 *
 * Fuentes: Smogon, experiencia competitiva general.
 */

const RECOMMENDED_ITEMS = {
    // ── Charizard ───────────────────────────────────────────────────────────
    charizard: [
        {
            item: "heavy-duty-boots",
            itemEs: "Botas Recias",
            reason:
                "Charizard es 4× débil a Roca (Fuego/Volador). Las Botas Recias " +
                "lo protegen del daño de Stealth Rock, permitiéndole entrar y salir " +
                "del combate sin perder el 50% de su vida.",
        },
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Aumenta un 30% todo el daño que inflige a cambio de algo de PV. " +
                "Ideal para sets ofensivos aprovechando su Sp. Atk de 109 y " +
                "Solar Power (oculta) para un daño devastador.",
        },
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Potencia sus ataques especiales un 50% a costa de usar un solo " +
                "movimiento. Con Helada Ígnea, Anillo Ígneo o Dragón Pulso " +
                "puede derribar a muchos oponentes.",
        },
        {
            item: "choice-scarf",
            itemEs: "Pañuelo Elegir",
            reason:
                "Su velocidad base de 100 es buena pero no suficiente. Con el " +
                "Pañuelo Elegir puede superar a amenazas como Greninja, " +
                "Dragapult o Garchomp y golpear primero.",
        },
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Recupera un 6.25% de PV cada turno. Para sets más defensivos " +
                "o de sustituto que buscan desgastar al rival turno a turno.",
        },
        {
            item: "charizardite-x",
            itemEs: "Charizardita X",
            reason:
                "Mega-Evoluciona a Charizard X (Fuego/Dragón), subiendo su " +
                "Ataque a 130 y obteniendo el talento 'Garra Dura' que potencia " +
                "los movimientos de contacto. Ideal para sets físicos.",
        },
        {
            item: "charizardite-y",
            itemEs: "Charizardita Y",
            reason:
                "Mega-Evoluciona a Charizard Y, con Sp. Atk de 159 y el talento " +
                "'Sequía' que invoca sol intenso. Sus movimientos de Fuego " +
                "se vuelven devastadores y reduce la necesidad de precisión " +
                "en Hidrocañón oTormenta Solar.",
        },
    ],

    // ── Pikachu / Raichu ────────────────────────────────────────────────────
    pikachu: [
        {
            item: "light-ball",
            itemEs: "Bola Luminosa",
            reason:
                "Duplica el Ataque y el Sp. Atk de Pikachu. Es su objeto " +
                "firma y la única razón por la que Pikachu puede ser viable " +
                "en combate. Sin él, sus estadísticas son muy bajas.",
        },
        {
            item: "focus-sash",
            itemEs: "Banda Focus",
            reason:
                "Pikachu es muy frágil. Con Banda Focus aguanta un golpe que " +
                "lo debilitaría y puede responder con un ataque potente o " +
                "una cobertura eléctrica.",
        },
        {
            item: "choice-scarf",
            itemEs: "Pañuelo Elegir",
            reason:
                "Su velocidad es decente pero con el Pañuelo puede superar " +
                "a rivales más rápidos. Combinado con Bola Luminosa, sus " +
                "ataques siguen siendo muy potentes.",
        },
    ],
    raichu: [
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Aumenta su dañoofensivo. Raichu tiene mejor stat spread " +
                "que Pikachu pero no puede usar Bola Luminosa, así que " +
                "Vida Esfera es su mejor opción para potenciar su daño.",
        },
        {
            item: "heavy-duty-boots",
            itemEs: "Botas Recias",
            reason:
                "Raichu es débil a Stealth Rock y suele cambiar de movimientos " +
                "con frecuencia. Las Botas lo protegen del daño de entrada.",
        },
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Su Sp. Atk es decente (90 base) y con Gafas Elegir puede " +
                "hacer un daño considerable con Trueno, Onda Voltio o " +
                "movimientos de cobertura.",
        },
    ],

    // ── Gengar ─────────────────────────────────────────────────────────────
    gengar: [
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Gengar tiene un Sp. Atk base de 130. Con Gafas Elegir, " +
                "movimientos como Pulso Umbrío, Bola Sombra o Puño Fuego " +
                "destrozan a cualquier rival que no los resista.",
        },
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Potencia todos sus ataques sin restringirse a un solo " +
                "movimiento. Perfecto para sets de cobertura con cuatro " +
                "ataques diferentes.",
        },
        {
            item: "focus-sash",
            itemEs: "Banda Focus",
            reason:
                "Gengar es rápido pero frágil. La Banda Focus le asegura " +
                "sobrevivir un golpe y poder responder o colocar un " +
                "movimiento de estado como Hipnosis o Burlas.",
        },
        {
            item: "black-sludge",
            itemEs: "Lodo Negro",
            reason:
                "Versión de Restos para los tipos Veneno. Recupera PV cada " +
                "turno. Útil en sets más defensivos o de desgaste.",
        },
    ],

    // ── Garchomp ────────────────────────────────────────────────────────────
    garchomp: [
        {
            item: "rough-helmet",
            itemEs: "Casco Dentado",
            reason:
                "Castiga a los atacantes físicos que golpean a Garchomp, " +
                "quitándoles un 16.67% de su vida. Su buena defensa base " +
                "de 95 le permite aguantar varios golpes físicos.",
        },
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Garchomp tiene un Ataque base de 130. Vida Esfera potencia " +
                "aún más su daño, convirtiéndolo en un wallbreaker temible " +
                "con Terremoto, Cola Dragón o Garra Dragón.",
        },
        {
            item: "choice-scarf",
            itemEs: "Pañuelo Elegir",
            reason:
                "Su velocidad base de 102 es excelente, pero con el Pañuelo " +
                "supera a amenazas como Dragapult, Greninja o Tapu Koko " +
                "y puede golpear primero con Terremoto o Draco-ataque.",
        },
        {
            item: "choice-band",
            itemEs: "Cinta Elegir",
            reason:
                "Su Ataque de 130 con Cinta Elegir y Terremoto STAB es " +
                "devastador. Pocos Pokémon pueden cambiar impunemente " +
                "ante un Garchomp con Cinta Elegir.",
        },
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Para sets de setup con Danza Espada. Los Restos le " +
                "permiten recuperar vida mientras se prepara para barrer " +
                "al equipo rival.",
        },
    ],

    // ── Lucario ─────────────────────────────────────────────────────────────
    lucario: [
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Lucario tiene Ataque 110 y Sp. Atk 115, perfecto para " +
                "sets mixtos. Vida Esfera potencia ambos tipos de ataque " +
                "y su talento 'Impasible' le da prioridad a los movimientos " +
                "de tipo Lucha tras un golpe.",
        },
        {
            item: "focus-sash",
            itemEs: "Banda Focus",
            reason:
                "Su defensa es baja (70) y su velocidad es decente (90). " +
                "Con Banda Focus aguanta un golpe, activa Impasible y " +
                "puede responder con Velocidad Extrema o Esfera Aural.",
        },
        {
            item: "choice-band",
            itemEs: "Cinta Elegir",
            reason:
                "Potencia al máximo su Ataque base de 110. Con movimientos " +
                "como Puño Meteoro, Terremoto o Velocidad Extrema, " +
                "Lucario se convierte en un peligro físico constante.",
        },
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Su Sp. Atk de 115 es excelente para un set especial con " +
                "Esfera Aural, Pulso Umbrío y Psíquico, evitando así " +
                "el contacto con posibles talentos como Efecto Espora.",
        },
    ],

    // ── Dragonite ───────────────────────────────────────────────────────────
    dragonite: [
        {
            item: "heavy-duty-boots",
            itemEs: "Botas Recias",
            reason:
                "Dragonite es 4× débil a Hielo y 2× a Roca. Las Botas " +
                "lo protegen de Stealth Rock, y su talento 'Inner Focus' " +
                "evita que le bajen la velocidad. Ideal para sets de " +
                "Danza Dragón.",
        },
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Recuperación pasiva mientras se prepara con Danza Dragón " +
                "o Multigolpe. Su buena defensa base de 95 le permite " +
                "setup repetidas veces.",
        },
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Potencia su Ataque de 134 sin perder versatilidad. " +
                "Perfecto para sets de cuatro ataques sin setup.",
        },
        {
            item: "choice-band",
            itemEs: "Cinta Elegir",
            reason:
                "Con Cinta Elegir y su Ataque de 134, Dragonite tiene " +
                "un poder de golpe inmenso. Velocidad Extrema le da " +
                "prioridad para rematar rivales debilitados.",
        },
    ],

    // ── Tyranitar ───────────────────────────────────────────────────────────
    tyranitar: [
        {
            item: "choice-scarf",
            itemEs: "Pañuelo Elegir",
            reason:
                "Su velocidad base de 61 es baja, pero con el Pañuelo " +
                "sorprende a muchos rivales. Su talento 'Chorro Arena' " +
                "invoca tormenta de arena que potencia su Sp. Def.",
        },
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Recuperación pasiva. Su buena defensa (110) y Sp. Def " +
                "potenciada por la arena lo hacen muy bulky.",
        },
        {
            item: "assault-vest",
            itemEs: "Chaleco Asalto",
            reason:
                "Su Sp. Def ya es buena (100) y con el Chaleco Asalto " +
                "se vuelve increíblemente bulky especial, pudiendo " +
                "cambiar contra ataques especiales que otros no podrían.",
        },
        {
            item: "choice-band",
            itemEs: "Cinta Elegir",
            reason:
                "Su Ataque de 134 es imponente. Con Cinta Elegir y " +
                "movimientos como Roca Afilada, Terremoto o Triturar, " +
                "Tyranitar es un wallbreaker físico de primer nivel.",
        },
    ],

    // ── Metagross ───────────────────────────────────────────────────────────
    metagross: [
        {
            item: "choice-band",
            itemEs: "Cinta Elegir",
            reason:
                "Su Ataque base de 135 es Brutal. Con Cinta Elegir y " +
                "Puño Meteoro STAB, Metagross es un wallbreaker " +
                "físico que pocos pueden frenar.",
        },
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Para sets más versátiles que requieran cambiar de " +
                "movimiento. Su buena cobertura (Puño Meteoro, " +
                "Terremoto, Puño Trueno, Frío Polar) le permite " +
                "golpear a muchos tipos.",
        },
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Su defensa base de 130 le permite aguantar golpes " +
                "físicos y recuperarse con los Restos mientras " +
                "desgasta al rival.",
        },
        {
            item: "assault-vest",
            itemEs: "Chaleco Asalto",
            reason:
                "Su Sp. Def de 90 no es mala y el Chaleco Asalto " +
                "la potencia aún más, convirtiendo a Metagross " +
                "en un tanque completo por ambos lados.",
        },
    ],

    // ── Greninja ────────────────────────────────────────────────────────────
    greninja: [
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Greninja tiene un Sp. Atk base de 103 y velocidad de " +
                "122. Vida Esfera potencia todos sus ataques y su " +
                "talento 'Mudar' le da cobertura STAB a sus movimientos " +
                "según el tipo del rival.",
        },
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Con Gafas Elegir, Hidrobomba y sus movimientos de " +
                "cobertura (oscuridad, hielo, lucha) hacen un daño " +
                "inmenso. Su velocidad asegura golpear primero casi siempre.",
        },
        {
            item: "focus-sash",
            itemEs: "Banda Focus",
            reason:
                "Aunque es rápido, hay rivales más rápidos. La Banda " +
                "Focus le asegura sobrevivir un golpe y poder responder " +
                "o cambiar para mantener presión.",
        },
        {
            item: "heavy-duty-boots",
            itemEs: "Botas Recias",
            reason:
                "Protege a Greninja del daño de Stealth Rock, permitiéndole " +
                "entrar y salir del combate con frecuencia sin perder vida.",
        },
    ],

    // ── Aegislash ───────────────────────────────────────────────────────────
    aegislash: [
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Aegislash alterna entre forma Escudo (altas defensas) y " +
                "forma Espada (alto ataque). Los Restos le permiten " +
                "recuperar vida mientras está en forma Escudo, alargando " +
                "su presencia en el campo.",
        },
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "En forma Espada su Ataque y Sp. Atk son de 150. Vida " +
                "Esfera potencia aún más su daño, y la pérdida de vida " +
                "se mitiga al cambiar a forma Escudo.",
        },
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Su Sp. Atk de 150 en forma Espada es impresionante. " +
                "Con Gafas Elegir y movimientos como Esfera Sombra " +
                "o Juego Limpio, derrite a cualquier rival.",
        },
        {
            item: "air-balloon",
            itemEs: "Globo Helio",
            reason:
                "Lo hace inmune a Terremoto, su debilidad más común. " +
                "Mientras el globo esté intacto, Aegislash puede " +
                "cambiar sin preocuparse por movimientos de tipo Tierra.",
        },
    ],

    // ── Togekiss ────────────────────────────────────────────────────────────
    togekiss: [
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Recuperación pasiva que combinada con su talento " +
                "'Dicha' le da mucha longevidad. Ideal para sets de " +
                "Viento Afín o de desgaste.",
        },
        {
            item: "scope-lens",
            itemEs: "Lupa",
            reason:
                "Su talento 'Dicha' duplica el ratio de crítico. Con " +
                "la Lupa, sus movimientos tienen 50% de crítico, " +
                "ignorando las bajadas de ataque y las defensas del rival.",
        },
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Su Sp. Atk base de 120 no es nada despreciable. " +
                "Con Gafas Elegir, su Llama Viva o su Respiro " +
                "hacen un daño considerable.",
        },
        {
            item: "heavy-duty-boots",
            itemEs: "Botas Recias",
            reason:
                "Es 2× débil a Roca y 2× a Hielo. Las Botas la protegen " +
                "de Stealth Rock, facilitando su entrada múltiple.",
        },
    ],

    // ── Excadrill ───────────────────────────────────────────────────────────
    excadrill: [
        {
            item: "choice-scarf",
            itemEs: "Pañuelo Elegir",
            reason:
                "Su velocidad de 88 es decente pero con el Pañuelo " +
                "supera a la mayoría de Pokémon. Su talento 'Mold Breaker' " +
                "ignora habilidades del rival como Cuerpo Llama o " +
                "Levitación para golpear con Terremoto.",
        },
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Su Ataque de 135 es excelente. Vida Esfera lo convierte " +
                "en un wallbreaker que puede cambiar de movimiento " +
                "libremente. Ideal para sets de spinner.",
        },
        {
            item: "air-balloon",
            itemEs: "Globo Helio",
            reason:
                "Lo hace inmune a Terremoto, permitiéndole entrar " +
                "ante rivales de tipo Tierra que de otro modo lo " +
                "amenazarían. Muy útil en equipos de arena.",
        },
        {
            item: "focus-sash",
            itemEs: "Banda Focus",
            reason:
                "Para asegurar que pueda colocar Stealth Rock o " +
                "golpear antes de caer. Su velocidad decente " +
                "ayuda a que la Banda Focus tenga más utilidad.",
        },
    ],

    // ── Rotom-Wash ──────────────────────────────────────────────────────────
    "rotom-wash": [
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Rotom Lavadora es un Pokémon defensivo por naturaleza " +
                "con buena resistencia. Los Restos le dan recuperación " +
                "pasiva que le permite aguantar más turnos.",
        },
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Su Sp. Atk base de 105 es bueno y su STAB Agua/Electrico " +
                "tiene buena cobertura. Con Gafas Elegir, Hidrobomba " +
                "y Voltio Cruel hacen mucho daño.",
        },
        {
            item: "heavy-duty-boots",
            itemEs: "Botas Recias",
            reason:
                "Evita el daño de Stealth Rock y de Entrada Roca, " +
                "permitiéndole cambiar libremente para hacer " +
                "pivot con Voltio Cruel.",
        },
        {
            item: "assault-vest",
            itemEs: "Chaleco Asalto",
            reason:
                "Su Sp. Def base de 107 ya es buena. Con el Chaleco " +
                "Asalto se vuelve muy bulky especial, pudiendo " +
                "cambiar ante ataques especiales sin problema.",
        },
    ],

    // ── Blissey ─────────────────────────────────────────────────────────────
    blissey: [
        {
            item: "heavy-duty-boots",
            itemEs: "Botas Recias",
            reason:
                "Blissey es el muro especial por excelencia (HP 255, Sp. Def 135). " +
                "Las Botas evitan que Stealth Rock consuma su vida cada vez " +
                "que entra, que es constantemente.",
        },
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Recuperación pasiva turno a turno. Combinado con su " +
                "enorme HP, los Restos le permiten recuperar mucha " +
                "vida a lo largo del combate.",
        },
        {
            item: "rocky-helmet",
            itemEs: "Casco Dentado",
            reason:
                "Castiga a los atacantes físicos que golpean a Blissey. " +
                "Aunque su defensa física es baja (10), el Casco " +
                "desgasta a los rivales que la atacan físicamente.",
        },
    ],

    // ── Ferrothorn ──────────────────────────────────────────────────────────
    ferrothorn: [
        {
            item: "leftovers",
            itemEs: "Restos",
            reason:
                "Ferrothorn es un muro físico con HP 74, Def 131, Sp. Def 116. " +
                "Los Restos mitigan el daño del recurrente y le dan " +
                "longevidad para colocar púas y piquitos.",
        },
        {
            item: "rocky-helmet",
            itemEs: "Casco Dentado",
            reason:
                "Castiga a los atacantes físicos que lo golpean. " +
                "Su talento 'Punta Acero' ya hace daño al contacto, " +
                "y el Casco Dentado añade aún más desgaste.",
        },
        {
            item: "choice-band",
            itemEs: "Cinta Elegir",
            reason:
                "Para sets ofensivos con 'Golpe Cuerpo' y 'Poder Pasado'. " +
                "Con Cinta Elegir, Ferrothorn sorprende con un daño " +
                "inesperadamente alto.",
        },
    ],

    // ── Dragapult ───────────────────────────────────────────────────────────
    dragapult: [
        {
            item: "choice-specs",
            itemEs: "Gafas Elegir",
            reason:
                "Su velocidad base de 142 es la más alta del juego. " +
                "Con Gafas Elegir y su Sp. Atk de 100, puede golpear " +
                "primero con Draco-metralleta y Bola Sombra con " +
                "un poder devastador.",
        },
        {
            item: "choice-band",
            itemEs: "Cinta Elegir",
            reason:
                "Su ataque físico de 120 es excelente. Con Cinta Elegir " +
                "y movimientos como Garata Dragón, Cola Férrea " +
                "o Alarido, es un físico cleaner temible.",
        },
        {
            item: "life-orb",
            itemEs: "Vida Esfera",
            reason:
                "Para sets mixtos o de 4 ataques. Su velocidad le " +
                "permite golpear primero casi siempre, y Vida Esfera " +
                "potencia todo su daño.",
        },
        {
            item: "heavy-duty-boots",
            itemEs: "Botas Recias",
            reason:
                "Protege a Dragapult del daño de Stealth Rock, " +
                "permitiéndole hacer pivot libremente con su " +
                "alta velocidad y U-turn.",
        },
    ],
};

/**
 * Obtiene los items recomendados para un Pokémon dado.
 * @param {string} pokemonName - Nombre del Pokémon en inglés (minúsculas)
 * @returns {Array<{item: string, itemEs: string, reason: string}>}
 */
export function getRecommendedItems(pokemonName) {
    const name = pokemonName?.toLowerCase();
    return RECOMMENDED_ITEMS[name] || null;
}

/**
 * Lista de todos los Pokémon que tienen recomendaciones.
 * @returns {string[]}
 */
export function getPokemonWithRecommendations() {
    return Object.keys(RECOMMENDED_ITEMS);
}
