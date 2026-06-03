// ── Config ──
const SERVER_ID = '6a16d56a9bd4b6296506e1d7';
const PROXY_BASE = 'https://gentle-sea-9ea3.rubensampercruz123.workers.dev';
const API_URL = `${PROXY_BASE}/api/players`;

// ── Normalización ──
function normalizePlayersResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.players)) return data.players;
  if (data && data.players && typeof data.players === 'object') return Object.values(data.players);
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

// ── Helpers ──
function getSpeciesName(pk) {
  const raw = pk.Species || pk.species || pk.name || pk.pokemon || '';
  if (raw.includes(':')) return raw.split(':')[1];
  return raw;
}

function getApiTypes(pk) {
  const types = [];
  if (pk.Type1) types.push(pk.Type1.toLowerCase());
  if (pk.Type2 && pk.Type2.toLowerCase() !== (pk.Type1 || '').toLowerCase()) {
    types.push(pk.Type2.toLowerCase());
  }
  return types;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

// ── Sprites ──
function getSpriteUrl(pokemonName, isShiny = false, dexNumber = null) {
  if (dexNumber) {
    const shiny = isShiny ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny}${dexNumber}.png`;
  }
  const key = pokemonName
    .toLowerCase()
    .replace(/[_ ]/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://img.pokemondb.net/sprites/scarlet-violet/icon/${key}.png`;
}

// ── HP bar class ──
function getHpClass(pct) {
  if (pct > 50) return 'hp-high';
  if (pct > 20) return 'hp-mid';
  return 'hp-low';
}

// ── Tipo de efectos (debilidades/resistencias/inmunidades) ──
const TYPE_EFFECTS = {
  normal:   { weak:["fighting"],resist:[],immune:["ghost"] },
  fire:     { weak:["water","ground","rock"],resist:["fire","grass","ice","bug","steel","fairy"],immune:[] },
  water:    { weak:["electric","grass"],resist:["fire","water","ice","steel"],immune:[] },
  electric: { weak:["ground"],resist:["electric","flying","steel"],immune:[] },
  grass:    { weak:["fire","ice","poison","flying","bug"],resist:["water","electric","grass","ground"],immune:[] },
  ice:      { weak:["fire","fighting","rock","steel"],resist:["ice"],immune:[] },
  fighting: { weak:["flying","psychic","fairy"],resist:["bug","rock","dark"],immune:[] },
  poison:   { weak:["ground","psychic"],resist:["grass","fighting","poison","bug","fairy"],immune:[] },
  ground:   { weak:["water","grass","ice"],resist:["poison","rock"],immune:["electric"] },
  flying:   { weak:["electric","ice","rock"],resist:["grass","fighting","bug"],immune:["ground"] },
  psychic:  { weak:["bug","ghost","dark"],resist:["fighting","psychic"],immune:[] },
  bug:      { weak:["fire","flying","rock"],resist:["grass","fighting","ground"],immune:[] },
  rock:     { weak:["water","grass","fighting","ground","steel"],resist:["normal","fire","poison","flying"],immune:[] },
  ghost:    { weak:["ghost","dark"],resist:["poison","bug"],immune:["normal","fighting"] },
  dragon:   { weak:["ice","dragon","fairy"],resist:["fire","water","electric","grass"],immune:[] },
  dark:     { weak:["fighting","bug","fairy"],resist:["ghost","dark"],immune:["psychic"] },
  steel:    { weak:["fire","fighting","ground"],resist:["normal","grass","ice","flying","psychic","bug","rock","dragon","steel","fairy"],immune:["poison"] },
  fairy:    { weak:["poison","steel"],resist:["fighting","bug","dark"],immune:["dragon"] }
};

const STAT_NAMES = { hp:"PS",attack:"Ataque",defense:"Defensa","special-attack":"At.Esp","special-defense":"Def.Esp",speed:"Velocidad" };
const STAT_COLORS = { hp:"#4ade80",attack:"#f87171",defense:"#facc15","special-attack":"#60a5fa","special-defense":"#a78bfa",speed:"#34d399" };

const NATURE_MAP = {
  "hardy":{},"lonely":{up:"attack",down:"defense"},"brave":{up:"attack",down:"speed"},"adamant":{up:"attack",down:"special-attack"},"naughty":{up:"attack",down:"special-defense"},"bold":{up:"defense",down:"attack"},
  "docile":{},"relaxed":{up:"defense",down:"speed"},"impish":{up:"defense",down:"special-attack"},"lax":{up:"defense",down:"special-defense"},"timid":{up:"speed",down:"attack"},
  "hasty":{up:"speed",down:"defense"},"serious":{},"jolly":{up:"speed",down:"special-attack"},"naive":{up:"speed",down:"special-defense"},"modest":{up:"special-attack",down:"attack"},
  "mild":{up:"special-attack",down:"defense"},"quiet":{up:"special-attack",down:"speed"},"bashful":{},"rash":{up:"special-attack",down:"special-defense"},"calm":{up:"special-defense",down:"attack"},
  "gentle":{up:"special-defense",down:"defense"},"sassy":{up:"special-defense",down:"speed"},"careful":{up:"special-defense",down:"special-attack"},"quirky":{}
};

// ── Cálculo de stats ──
function calcStat(base, iv, ev, level, natureMult = 1) {
  return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * natureMult);
}
function calcHP(base, iv, ev, level) {
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
}

const COB_STAT_MAP = { hp:'hp', attack:'attack', defence:'defense', 'special-attack':'special_attack', 'special-defense':'special_defence', speed:'speed' };

function extractIV(pk, stat) {
  const ivs = pk.IVs?.Base || pk.ivs || {};
  return ivs[`cobblemon:${stat}`] ?? ivs[stat] ?? 0;
}
function extractEV(pk, stat) {
  const evs = pk.EVs || pk.evs || {};
  return evs[`cobblemon:${stat}`] ?? evs[stat] ?? 0;
}

// ── Efectividad ──
function getEffectiveness(types) {
  const defs = { weak:{}, resist:{}, immune:[] };
  for (const t of types) {
    const e = TYPE_EFFECTS[t];
    if (!e) continue;
    for (const w of e.weak) defs.weak[w] = (defs.weak[w]||0) + 1;
    for (const r of e.resist) defs.resist[r] = (defs.resist[r]||0) + 1;
    for (const i of e.immune) if (!defs.immune.includes(i)) defs.immune.push(i);
  }
  const result = [];
  const allTypes = Object.keys(TYPE_EFFECTS);
  for (const t of allTypes) {
    if (defs.immune.includes(t)) continue;
    let mult = 1;
    mult *= (defs.weak[t]||0) * 2;
    mult /= Math.pow(2, defs.resist[t]||0);
    if (mult > 1) result.push({ type: t, mult, label: mult >= 4 ? '4×' : '2×', cls: 'weak' });
    else if (mult < 1) result.push({ type: t, mult, label: mult <= 0.25 ? '¼×' : '½×', cls: 'resist' });
  }
  return result.sort((a,b) => b.mult - a.mult);
}

// ── Fetch ──
async function fetchPlayers() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return normalizePlayersResponse(data);
}

// ── Análisis de equipo ──
function analyzeTeam(party) {
  const activeParty = party.filter(p => p != null);
  const allTypes = Object.keys(TYPE_EFFECTS);
  const weakDetail = {};
  const resistDetail = {};
  const immuneDetail = {};
  const moveCoverage = {};

  for (const pk of activeParty) {
    const name = capitalize(getSpeciesName(pk) || '??');
    const types = getApiTypes(pk);
    const moves = pk.MoveSet ? Object.values(pk.MoveSet).filter(m => m.MoveName) : [];

    for (const defenderType of types) {
      const eff = TYPE_EFFECTS[defenderType];
      if (!eff) continue;
      for (const atkType of eff.weak) {
        if (!weakDetail[atkType]) weakDetail[atkType] = [];
        if (!weakDetail[atkType].some(p => p.name === name)) weakDetail[atkType].push({ name, via: defenderType });
      }
      for (const atkType of eff.resist) {
        if (!resistDetail[atkType]) resistDetail[atkType] = [];
        if (!resistDetail[atkType].some(p => p.name === name)) resistDetail[atkType].push({ name, via: defenderType });
      }
      for (const atkType of eff.immune) {
        if (!immuneDetail[atkType]) immuneDetail[atkType] = [];
        if (!immuneDetail[atkType].some(p => p.name === name)) immuneDetail[atkType].push({ name, via: defenderType });
      }
    }

    for (const m of moves) {
      if (m.MoveType) {
        const mt = m.MoveType.toLowerCase();
        if (!moveCoverage[mt]) moveCoverage[mt] = [];
        if (!moveCoverage[mt].includes(name)) moveCoverage[mt].push(name);
      }
    }
  }

  const weaknesses = Object.entries(weakDetail).map(([type, pks]) => ({ type, count: pks.length, pks })).filter(w => w.count >= 2).sort((a,b) => b.count - a.count);
  const resistances = Object.entries(resistDetail).map(([type, pks]) => ({ type, count: pks.length, pks })).filter(r => r.count >= 2).sort((a,b) => b.count - a.count);
  const immunities = Object.entries(immuneDetail).map(([type, pks]) => ({ type, count: pks.length, pks })).filter(i => i.count > 0).sort((a,b) => b.count - a.count);
  const coverage = Object.entries(moveCoverage).map(([type, pks]) => ({ type, count: pks.length, pks })).sort((a,b) => b.count - a.count);

  const coveredTypes = coverage.map(c => c.type);
  const missingCoverage = allTypes.filter(t => !coveredTypes.includes(t));

  const criticalWeak = weaknesses.filter(w => w.count >= 3);

  return { partySize: activeParty.length, weaknesses, resistances, immunities, coverage, missingCoverage, criticalWeak };
}

// ── Nombres en español ──
const TYPE_ES = {
  normal: "Normal", fire: "Fuego", water: "Agua", grass: "Planta",
  electric: "Eléctrico", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
  ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
  rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
  steel: "Acero", fairy: "Hada",
};

const NATURE_ES = {
  hardy: "Fuerte", lonely: "Huraña", brave: "Valiente", adamant: "Firme",
  naughty: "Pícara", bold: "Osada", docile: "Dócil", relaxed: "Plácida",
  impish: "Agitada", lax: "Floja", timid: "Miedosa", hasty: "Activa",
  serious: "Seria", jolly: "Alegre", naive: "Ingenua", modest: "Modesta",
  mild: "Afable", quiet: "Callada", bashful: "Tímida", rash: "Alocada",
  calm: "Serena", gentle: "Amable", sassy: "Grosera", careful: "Cauta",
  quirky: "Rara",
};

// ── Caché global de traducciones ──
const translateCache = {};
let pendingTranslations = {};
let translationTimer = null;

async function flushTranslations() {
  const batch = { ...pendingTranslations };
  pendingTranslations = {};
  const entries = Object.entries(batch);

  const results = await Promise.allSettled(
    entries.map(async ([key, url]) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const spanish = data.names?.find((n) => n.language.name === "es");
      return { key, name: spanish?.name || null };
    })
  );

  results.forEach((r) => {
    if (r.status === "fulfilled" && r.value.name) {
      translateCache[r.value.key] = r.value.name;
    }
  });
}

/**
 * Traduce un término de PokeAPI (habilidad, objeto, movimiento) a español.
 * Usa caché global y acumula peticiones para lanzarlas en lotes.
 */
function getSpanishName(englishName, category) {
  const key = `${category}:${englishName.toLowerCase()}`;
  if (translateCache[key]) return translateCache[key];

  // ── Convertir nombre Cobblemon a formato PokeAPI ──
  // Cobblemon usa snake_case (mold_breaker) o CamelCase (MoldBreaker),
  // PokeAPI espera kebab-case (mold-breaker)
  let pokeName = englishName
    .toLowerCase()
    // Permitir guiones y guiones bajos temporalmente
    .replace(/[^a-z0-9_-]/g, "")
    // Convertir guiones bajos a guiones (snake_case → kebab-case)
    .replace(/_/g, "-")
    // Espacios a guiones
    .replace(/ /g, "-")
    // Colapsar guiones dobles
    .replace(/-+/g, "-");

  // Mapeo especial para ciertos objetos de Cobblemon
  const itemSpecial = {
    "assault_vest": "assault-vest",
    "choice_band": "choice-band",
    "choice_specs": "choice-specs",
    "choice_scarf": "choice-scarf",
    "life_orb": "life-orb",
    "leftovers": "leftovers",
    "focus_sash": "focus-sash",
    "heavy_duty_boots": "heavy-duty-boots",
  };

  if (category === "item" && itemSpecial[englishName]) {
    pokeName = itemSpecial[englishName];
  }

  // Para habilidades: convertir CamelCase a kebab-case
  // (ej: "MoldBreaker" → "mold-breaker")
  if (category === "ability") {
    const camelToKebab = englishName
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/_/g, "-");
    if (camelToKebab !== pokeName) {
      pokeName = camelToKebab;
    }
  }

  const url = `https://pokeapi.co/api/v2/${category}/${pokeName}`;

  // Acumular para próximo lote
  if (!pendingTranslations[key]) {
    pendingTranslations[key] = url;
    clearTimeout(translationTimer);
    translationTimer = setTimeout(flushTranslations, 50);
  }

  return null; // Todavía no disponible
}

export {
  SERVER_ID,
  API_URL,
  normalizePlayersResponse,
  getSpeciesName,
  getApiTypes,
  capitalize,
  getSpriteUrl,
  getHpClass,
  TYPE_EFFECTS,
  TYPE_ES,
  NATURE_ES,
  STAT_NAMES,
  STAT_COLORS,
  NATURE_MAP,
  COB_STAT_MAP,
  calcStat,
  calcHP,
  extractIV,
  extractEV,
  getEffectiveness,
  fetchPlayers,
  analyzeTeam,
  getSpanishName,
  translateCache,
};
