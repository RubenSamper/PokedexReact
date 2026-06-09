/**
 * nameConverter
 *
 * Convierte nombres de objetos y movimientos del formato de Smogon
 * (lowercase, sin espacios ni guiones) al formato de PokeAPI (kebab-case)
 * y proporciona nombres en español para objetos.
 *
 * @module nameConverter
 */

// ─── Items: Smogon → { api: kebab, es: español } ──────────────────────────

const ITEM_MAP = {
    leftovers:               { api: "leftovers",           es: "Restos" },
    blacksludge:             { api: "black-sludge",        es: "Lodo Negro" },
    sitrusberry:             { api: "sitrus-berry",        es: "Baya Atania" },
    lumberry:                { api: "lum-berry",           es: "Baya Alistán" },
    oranberry:               { api: "oran-berry",          es: "Baya Aran" },
    aguavberry:              { api: "aguav-berry",         es: "Baya Aguav" },
    figyberry:               { api: "figy-berry",          es: "Baya Higog" },
    wikiberry:               { api: "wiki-berry",          es: "Baya Wiki" },
    magoberry:               { api: "mago-berry",          es: "Baya Magua" },
    chestoberry:             { api: "chesto-berry",        es: "Baya Atabay" },
    leppaberry:              { api: "leppa-berry",         es: "Baya Lema" },
    shellbell:               { api: "shell-bell",          es: "Campana Concha" },
    choiceband:              { api: "choice-band",         es: "Cinta Elegir" },
    choicescarf:             { api: "choice-scarf",        es: "Pañuelo Elegir" },
    choicespecs:             { api: "choice-specs",        es: "Gafas Elegir" },
    lifeorb:                 { api: "life-orb",            es: "Vida Esfera" },
    expertbelt:              { api: "expert-belt",         es: "Cinta Fuerte" },
    wiseglasses:             { api: "wise-glasses",        es: "Gafas Listón" },
    muscleband:              { api: "muscle-band",         es: "Cinta Músculo" },
    loadeddice:              { api: "loaded-dice",         es: "Dado Trucado" },
    rockyhelmet:             { api: "rocky-helmet",        es: "Casco Dentado" },
    focussash:               { api: "focus-sash",          es: "Banda Focus" },
    focusband:               { api: "focus-band",          es: "Cinta Focus" },
    assaultvest:             { api: "assault-vest",        es: "Chaleco Asalto" },
    heavydutyboots:          { api: "heavy-duty-boots",    es: "Botas Recias" },
    airballoon:              { api: "air-balloon",         es: "Globo Helio" },
    lightclay:               { api: "light-clay",          es: "Arcilla Luminosa" },
    eviolite:                { api: "eviolite",            es: "Mineral Evolutivo" },
    safetygoggles:           { api: "safety-goggles",      es: "Gafas Protectoras" },
    protectivepads:          { api: "protective-pads",     es: "Protectores" },
    covertcloak:             { api: "covert-cloak",        es: "Capa Camuflaje" },
    ejectbutton:             { api: "eject-button",        es: "Botón Escape" },
    ejectpack:               { api: "eject-pack",          es: "Mochila Escape" },
    redcard:                 { api: "red-card",            es: "Tarjeta Roja" },
    shedshell:               { api: "shed-shell",          es: "Muda Concha" },
    brightpowder:            { api: "bright-powder",       es: "Polvo Brillante" },
    quickclaw:               { api: "quick-claw",          es: "Garra Rápida" },
    kingsrock:               { api: "kings-rock",          es: "Roca del Rey" },
    razorclaw:               { api: "razor-claw",          es: "Garra Afilada" },
    razorfang:               { api: "razor-fang",          es: "Colmillo Afilado" },
    scopelens:               { api: "scope-lens",          es: "Lupa" },
    widelens:                { api: "wide-lens",           es: "Lupa Amplia" },
    zoomlens:                { api: "zoom-lens",           es: "Lupa Zoom" },
    throatspray:             { api: "throat-spray",        es: "Espray Garganta" },
    blunderpolicy:           { api: "blunder-policy",      es: "Política Fallo" },
    roomservice:             { api: "room-service",        es: "Servicio Habitación" },
    stickybarb:              { api: "sticky-barb",         es: "Púa Pegajosa" },
    bindingband:             { api: "binding-band",        es: "Banda Ataduras" },
    gripclaw:                { api: "grip-claw",           es: "Garra Garfio" },
    bigroot:                 { api: "big-root",            es: "Raíz Grande" },
    blackbelt:               { api: "black-belt",          es: "Cinta Negra" },
    nevermeltice:            { api: "never-melt-ice",      es: "Hielo Eterno" },
    mentalherb:              { api: "mental-herb",         es: "Hierba Mental" },
    powerherb:               { api: "power-herb",          es: "Hierba Prodigiosa" },
    flameorb:                { api: "flame-orb",           es: "Llamasfera" },
    toxicorb:                { api: "toxic-orb",           es: "Toxiesfera" },
    heatrock:                { api: "heat-rock",           es: "Roca Calor" },
    damprock:                { api: "damp-rock",           es: "Roca Humedad" },
    smoothrock:              { api: "smooth-rock",         es: "Roca Lisa" },
    icyrock:                 { api: "icy-rock",            es: "Roca Helada" },
    terrainextender:         { api: "terrain-extender",    es: "Ampliador Terreno" },
    electricseed:            { api: "electric-seed",       es: "Semilla Eléctrica" },
    psychicseed:             { api: "psychic-seed",        es: "Semilla Psíquica" },
    mistyseed:               { api: "misty-seed",          es: "Semilla Niebla" },
    grassseed:               { api: "grass-seed",          es: "Semilla Hierba" },
    pixieplate:              { api: "pixie-plate",         es: "Placa Feérica" },
    spookyplate:             { api: "spooky-plate",        es: "Placa Terror" },
    fistplate:               { api: "fist-plate",          es: "Placa Fuerte" },
    skyplate:                { api: "sky-plate",           es: "Placa Cielo" },
    splashplate:             { api: "splash-plate",        es: "Placa Agua" },
    earthplate:              { api: "earth-plate",         es: "Placa Tierra" },
    insectplate:             { api: "insect-plate",        es: "Placa Bicho" },
    dreadplate:              { api: "dread-plate",         es: "Placa Pavor" },
    icicleplate:             { api: "icicle-plate",        es: "Placa Hielo" },
    meadowplate:             { api: "meadow-plate",        es: "Placa Prado" },
    mindplate:               { api: "mind-plate",          es: "Placa Mente" },
    ironplate:               { api: "iron-plate",          es: "Placa Ferro" },
    flameplate:              { api: "flame-plate",         es: "Placa Llama" },
    stoneplate:              { api: "stone-plate",         es: "Placa Rocosa" },
    toxicplate:              { api: "toxic-plate",         es: "Placa Veneno" },
    zapplate:                { api: "zap-plate",           es: "Placa Relámpago" },
    blankplate:              { api: "blank-plate",         es: "Placa Null" },
    legendplate:             { api: "legend-plate",        es: "Placa Legendaria" },
    dracoplate:              { api: "draco-plate",         es: "Placa Draco" },
    firegem:                 { api: "fire-gem",            es: "Gema Fuego" },
    watergem:                { api: "water-gem",           es: "Gema Agua" },
    electricgem:             { api: "electric-gem",        es: "Gema Eléctrica" },
    grassgem:                { api: "grass-gem",           es: "Gema Planta" },
    icegem:                  { api: "ice-gem",             es: "Gema Hielo" },
    fightinggem:             { api: "fighting-gem",        es: "Gema Lucha" },
    poisongem:               { api: "poison-gem",          es: "Gema Veneno" },
    groundgem:               { api: "ground-gem",          es: "Gema Tierra" },
    flyinggem:               { api: "flying-gem",          es: "Gema Volador" },
    psychicgem:              { api: "psychic-gem",         es: "Gema Psíquico" },
    buggem:                  { api: "bug-gem",             es: "Gema Bicho" },
    rockgem:                 { api: "rock-gem",            es: "Gema Roca" },
    ghostgem:                { api: "ghost-gem",           es: "Gema Fantasma" },
    dragongem:               { api: "dragon-gem",          es: "Gema Dragón" },
    darkgem:                 { api: "dark-gem",            es: "Gema Siniestro" },
    steelgem:                { api: "steel-gem",           es: "Gema Acero" },
    fairygem:                { api: "fairy-gem",           es: "Gema Hada" },
    normalgem:               { api: "normal-gem",          es: "Gema Normal" },
    electricmemory:          { api: "electric-memory",     es: "Memoria Eléctrica" },
    firememory:              { api: "fire-memory",         es: "Memoria Fuego" },
    watermemory:             { api: "water-memory",        es: "Memoria Agua" },
    grassmemory:             { api: "grass-memory",        es: "Memoria Planta" },
    icememory:               { api: "ice-memory",          es: "Memoria Hielo" },
    fightingmemory:          { api: "fighting-memory",     es: "Memoria Lucha" },
    poisonmemory:            { api: "poison-memory",       es: "Memoria Veneno" },
    groundmemory:            { api: "ground-memory",       es: "Memoria Tierra" },
    flyingmemory:            { api: "flying-memory",       es: "Memoria Volador" },
    psychicmemory:           { api: "psychic-memory",      es: "Memoria Psíquico" },
    bugmemory:               { api: "bug-memory",          es: "Memoria Bicho" },
    rockmemory:              { api: "rock-memory",         es: "Memoria Roca" },
    ghostmemory:             { api: "ghost-memory",        es: "Memoria Fantasma" },
    dragonmemory:            { api: "dragon-memory",       es: "Memoria Dragón" },
    darkmemory:              { api: "dark-memory",         es: "Memoria Siniestro" },
    steelmemory:             { api: "steel-memory",        es: "Memoria Acero" },
    fairymemory:             { api: "fairy-memory",        es: "Memoria Hada" },
    shockdrive:              { api: "shock-drive",         es: "Pila Impacto" },
    burndrive:               { api: "burn-drive",          es: "Pila Llama" },
    chilldrive:               { api: "chill-drive",         es: "Pila Glaciar" },
    dousedrive:              { api: "douse-drive",         es: "Pila Acuática" },
};

// ─── Movimientos: Smogon → PokeAPI kebab-case ─────────────────────────────

const MOVE_MAP = {
    earthquake:              "earthquake",
    swordsdance:             "swords-dance",
    stealthrock:             "stealth-rock",
    scaleshot:               "scale-shot",
    dragonclaw:              "dragon-claw",
    closecombat:             "close-combat",
    stoneedge:               "stone-edge",
    firefang:                "fire-fang",
    icefang:                 "ice-fang",
    thunderfang:             "thunder-fang",
    poisonfang:              "poison-fang",
    psychofangs:             "psycho-fang",
    knockoff:                "knock-off",
    uturn:                   "u-turn",
    playrough:               "play-rough",
    ironhead:                "iron-head",
    bodypress:               "body-press",
    heavyslam:               "heavy-slam",
    gigaimpact:              "giga-impact",
    rockslide:               "rock-slide",
    rockblast:               "rock-blast",
    headlongrush:            "headlong-rush",
    headsmash:               "head-smash",
    woodhammer:              "wood-hammer",
    doubleedge:              "double-edge",
    flareblitz:              "flare-blitz",
    wildcharge:              "wild-charge",
    bravebird:               "brave-bird",
    dualwingbeat:            "dual-wingbeat",
    acrobatics:              "acrobatics",
    drillrun:                "drill-run",
    liquidation:             "liquidation",
    aquacutter:              "aqua-cutter",
    aquajet:                 "aqua-jet",
    wavecrash:               "wave-crash",
    waterfall:               "waterfall",
    poltergeist:             "poltergeist",
    phantomforce:            "phantom-force",
    shadowclaw:              "shadow-claw",
    shadowsneak:             "shadow-sneak",
    suckerpunch:             "sucker-punch",
    bulletpunch:             "bullet-punch",
    machpunch:               "mach-punch",
    icepunch:                "ice-punch",
    firepunch:               "fire-punch",
    thunderpunch:            "thunder-punch",
    drainpunch:              "drain-punch",
    meteormash:              "meteor-mash",
    irontail:                "iron-tail",
    gyroball:                "gyro-ball",
    flashcannon:             "flash-cannon",
    xscissor:                "x-scissor",
    megahorn:                "megahorn",
    leechlife:               "leech-life",
    firstimpression:         "first-impression",
    outrage:                 "outrage",
    dragontail:              "dragon-tail",
    axekick:                 "axe-kick",
    tripleaxel:              "triple-axel",
    shadowball:              "shadow-ball",
    moonblast:               "moonblast",
    earthpower:              "earth-power",
    flamethrower:            "flamethrower",
    fireblast:               "fire-blast",
    overheat:                "overheat",
    lavaplume:               "lava-plume",
    surf:                    "surf",
    hydropump:               "hydro-pump",
    scald:                   "scald",
    icebeam:                 "ice-beam",
    blizzard:                "blizzard",
    freezedry:               "freeze-dry",
    thunderbolt:             "thunderbolt",
    thunder:                 "thunder",
    voltswitch:              "volt-switch",
    energyball:              "energy-ball",
    grassknot:               "grass-knot",
    gigadrain:               "giga-drain",
    psychic:                 "psychic",
    psyshock:                "psyshock",
    futuresight:             "future-sight",
    expandingforce:          "expanding-force",
    darkpulse:               "dark-pulse",
    aurasphere:              "aura-sphere",
    focusblast:              "focus-blast",
    vacuumwave:              "vacuum-wave",
    dazzlinggleam:           "dazzling-gleam",
    hypervoice:              "hyper-voice",
    boomburst:               "boomburst",
    sludgewave:              "sludge-wave",
    sludgebomb:              "sludge-bomb",
    venoshock:               "venoshock",
    terablast:               "tera-blast",
    triattack:               "tri-attack",
    heatwave:                "heat-wave",
    airslash:                "air-slash",
    hurricane:               "hurricane",
    bugbuzz:                 "bug-buzz",
    dragonpulse:             "dragon-pulse",
    dracometeor:             "draco-meteor",
    powergem:                "power-gem",
    storedpower:             "stored-power",
    clearsmog:               "clear-smog",
    leafstorm:               "leaf-storm",
    petaldance:              "petal-dance",
    makeitrain:              "make-it-rain",
    torchsong:               "torch-song",
    electroshot:             "electro-shot",
    risingvoltage:           "rising-voltage",
    chillingwater:           "chilling-water",
    snipeshot:               "snipe-shot",
    substitute:              "substitute",
    protect:                 "protect",
    detect:                  "detect",
    rest:                    "rest",
    sleeptalk:               "sleep-talk",
    toxic:                   "toxic",
    toxicspikes:             "toxic-spikes",
    willowisp:               "will-o-wisp",
    thunderwave:             "thunder-wave",
    taunt:                   "taunt",
    encore:                  "encore",
    trick:                   "trick",
    switcheroo:              "switcheroo",
    defog:                   "defog",
    rapidspin:               "rapid-spin",
    spikes:                  "spikes",
    roar:                    "roar",
    whirlwind:               "whirlwind",
    circlethrow:             "circle-throw",
    calmmind:                "calm-mind",
    nastyplot:               "nasty-plot",
    dragondance:             "dragon-dance",
    bulkup:                  "bulk-up",
    irondefense:             "iron-defense",
    acidarmor:               "acid-armor",
    cosmicpower:             "cosmic-power",
    amnesia:                 "amnesia",
    agility:                 "agility",
    quiverdance:             "quiver-dance",
    shiftgear:               "shift-gear",
    coil:                    "coil",
    curse:                   "curse",
    growth:                  "growth",
    honeclaws:               "hone-claws",
    shellsmash:              "shell-smash",
    workup:                  "work-up",
    reflect:                 "reflect",
    lightscreen:             "light-screen",
    auroraveil:              "aurora-veil",
    trickroom:               "trick-room",
    raindance:               "rain-dance",
    sunnyday:                "sunny-day",
    sandstorm:               "sandstorm",
    hail:                    "hail",
    gravity:                 "gravity",
    wonderroom:              "wonder-room",
    magicroom:               "magic-room",
    stickyweb:               "sticky-web",
    healbell:                "heal-bell",
    aromatherapy:            "aromatherapy",
    wish:                    "wish",
    recover:                 "recover",
    slackoff:                "slack-off",
    softboiled:              "soft-boiled",
    milkdrink:               "milk-drink",
    shoreup:                 "shore-up",
    roost:                   "roost",
    synthesis:               "synthesis",
    moonlight:               "moonlight",
    morningsun:              "morning-sun",
    strengthsap:             "strength-sap",
    teleport:                "teleport",
    batonpass:               "baton-pass",
    courtchange:             "court-change",
    mortalspin:              "mortal-spin",
};

// ─── Naturalezas: inglés → español ──────────────────────────────────────────

const NATURE_MAP = {
    hardy:    { es: "Fuerte",    up: "Ataque",      down: "Ataque" },
    lonely:   { es: "Huraña",    up: "Ataque",      down: "Defensa" },
    brave:    { es: "Audaz",     up: "Ataque",      down: "Velocidad" },
    adamant:  { es: "Firme",     up: "Ataque",      down: "Ataque Esp." },
    naughty:  { es: "Pícara",    up: "Ataque",      down: "Defensa Esp." },
    bold:     { es: "Osada",     up: "Defensa",     down: "Ataque" },
    docile:   { es: "Dócil",     up: "Defensa",     down: "Defensa" },
    relaxed:  { es: "Plácida",   up: "Defensa",     down: "Velocidad" },
    impish:   { es: "Agitada",   up: "Defensa",     down: "Ataque Esp." },
    lax:      { es: "Floja",     up: "Defensa",     down: "Defensa Esp." },
    timid:    { es: "Miedosa",   up: "Velocidad",   down: "Ataque" },
    hasty:    { es: "Activa",    up: "Velocidad",   down: "Defensa" },
    serious:  { es: "Serena",    up: "Velocidad",   down: "Velocidad" },
    jolly:    { es: "Alegre",    up: "Velocidad",   down: "Ataque Esp." },
    naive:    { es: "Ingenua",   up: "Velocidad",   down: "Defensa Esp." },
    modest:   { es: "Modesta",   up: "Ataque Esp.", down: "Ataque" },
    mild:     { es: "Afable",    up: "Ataque Esp.", down: "Defensa" },
    quiet:    { es: "Mansa",     up: "Ataque Esp.", down: "Velocidad" },
    bashful:  { es: "Tímida",    up: "Ataque Esp.", down: "Ataque Esp." },
    rash:     { es: "Alocada",   up: "Ataque Esp.", down: "Defensa Esp." },
    calm:     { es: "Calma",     up: "Defensa Esp.",down: "Ataque" },
    gentle:   { es: "Amable",    up: "Defensa Esp.",down: "Defensa" },
    sassy:    { es: "Grosera",   up: "Defensa Esp.",down: "Velocidad" },
    careful:  { es: "Cauta",     up: "Defensa Esp.",down: "Ataque Esp." },
    quirky:   { es: "Rara",      up: "Defensa Esp.",down: "Defensa Esp." },
};

/**
 * Traduce una naturaleza del inglés al español.
 * @param {string} natureName - Nombre en inglés (ej. "Jolly", "adamant")
 * @returns {string} Nombre en español (ej. "Alegre")
 */
export function natureToEs(natureName) {
    const entry = NATURE_MAP[natureName?.toLowerCase()];
    return entry?.es || natureName;
}

// ─── Funciones públicas ─────────────────────────────────────────────────────

/**
 * Convierte un nombre de objeto de Smogon a formato PokeAPI (kebab-case).
 * @param {string} smogonName - Ej. "rockyhelmet"
 * @returns {string} Ej. "rocky-helmet"
 */
export function itemSmogonToApi(smogonName) {
    const entry = ITEM_MAP[smogonName?.toLowerCase()];
    return entry?.api || smogonName;
}

/**
 * Obtiene el nombre en español de un objeto.
 * @param {string} smogonName - Ej. "rockyhelmet"
 * @returns {string|null} Nombre en español o null
 */
export function itemSmogonToEs(smogonName) {
    const entry = ITEM_MAP[smogonName?.toLowerCase()];
    return entry?.es || null;
}

/**
 * Convierte un nombre de movimiento de Smogon a formato PokeAPI (kebab-case).
 * @param {string} smogonName - Ej. "swordsdance"
 * @returns {string} Ej. "sword-dance"
 */
export function moveSmogonToApi(smogonName) {
    const cleaned = smogonName?.toLowerCase().replace(/\s+/g, "");
    return MOVE_MAP[cleaned] || smogonName;
}

/**
 * Genera la URL del sprite de un objeto desde PokeAPI.
 * @param {string} apiName - Nombre PokeAPI del objeto (kebab-case)
 * @returns {string} URL del sprite PNG
 */
export function getItemSpriteUrl(apiName) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${apiName}.png`;
}

/**
 * Obtiene la URL del endpoint de PokeAPI para un movimiento.
 * @param {string} apiName - Nombre PokeAPI del movimiento
 * @returns {string} URL del movimiento
 */
export function getMoveApiUrl(apiName) {
    return `https://pokeapi.co/api/v2/move/${apiName}/`;
}

/**
 * Formatea un nombre en kebab-case a título (ej. "sword-dance" → "Sword Dance").
 * @param {string} kebabName
 * @returns {string}
 */
export function kebabToTitle(kebabName) {
    if (!kebabName) return "";
    return kebabName
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}
