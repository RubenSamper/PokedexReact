import { useState, useEffect, useMemo } from "react";
import { BiX, BiDiamond } from "react-icons/bi";
import { usePokemonDetails } from "../hooks/usePokemonForBuilder";
import StatsEditor from "./StatsEditor";
import styles from "./PokemonEditorModal.module.css";

const TYPE_COLORS = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
    electric: "#F7D02C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

export default function PokemonEditorModal({ slot, speciesList, onSave, onClose }) {
    const [search, setSearch] = useState("");
    const [selectedSpecies, setSelectedSpecies] = useState(slot.species?.name || "");
    const [ability, setAbility] = useState(slot.ability?.name || "");
    const [moves, setMoves] = useState(slot.moves.map((m) => m.name));
    const [shiny, setShiny] = useState(slot.shiny || false);
    const [nature, setNature] = useState(slot.nature || "serious");
    const [level, setLevel] = useState(slot.level || 100);
    const [ivs, setIvs] = useState(slot.ivs || { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, spe: 31 });
    const [evs, setEvs] = useState(slot.evs || { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spe: 0 });

    const { data: details, isLoading } = usePokemonDetails(selectedSpecies);

    // Solo movimientos que este Pokémon puede aprender realmente
    const learnableMoves = details?.moves || [];

    // Filtrar lista de especies por búsqueda
    const filteredSpecies = useMemo(() => {
        if (!speciesList || speciesList.length === 0) return [];
        const q = search.toLowerCase();
        return speciesList.filter(
            (s) =>
                s.name.includes(q) ||
                s.nameEs.toLowerCase().includes(q) ||
                String(s.id).padStart(3, "0").includes(q)
        ).slice(0, 50);
    }, [speciesList, search]);

    useEffect(() => {
        if (slot.species) {
            setSelectedSpecies(slot.species.name);
            setAbility(slot.ability?.name || "");
            setMoves(slot.moves.map((m) => m.name));
            setShiny(slot.shiny || false);
            setNature(slot.nature || "serious");
            setLevel(slot.level || 100);
            setIvs(slot.ivs || { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, spe: 31 });
            setEvs(slot.evs || { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spe: 0 });
        }
    }, [slot]);

    const handleSave = () => {
        if (!details) return;

        const abilityObj = details.abilities.find((a) => a.name === ability) || null;

        // Solo guardar movimientos que realmente puede aprender
        const validMoves = moves.filter((mn) => mn && learnableMoves.includes(mn));

        onSave({
            species: {
                id: details.id,
                name: details.name,
                nameEs:
                    speciesList.find((s) => s.name === details.name)?.nameEs ||
                    details.name.charAt(0).toUpperCase() + details.name.slice(1),
                types: details.types,
                sprite: details.sprite,
            },
            ability: abilityObj
                ? { name: abilityObj.name, nameEs: abilityObj.nameEs }
                : null,
            moves: validMoves.map((mn) => ({ name: mn })),
            nature,
            level,
            shiny,
            ivs,
            evs,
        });
    };

    const handleSelectSpecies = (name) => {
        setSelectedSpecies(name);
        setAbility("");
        setMoves([]);
        setSearch("");
    };

    // Búsqueda de movimientos (solo los que aprende este Pokémon)
    const [moveSearch, setMoveSearch] = useState("");
    const filteredMoves = useMemo(() => {
        if (!moveSearch) return [];
        const q = moveSearch.toLowerCase();
        return learnableMoves
            .filter((m) => m.includes(q))
            .slice(0, 30);
    }, [learnableMoves, moveSearch]);

    const handleAddMove = (moveName) => {
        if (moves.length >= 4) return;
        if (moves.includes(moveName)) return;
        // Seguridad extra: solo si está en el learnset
        if (!learnableMoves.includes(moveName)) return;
        setMoves((prev) => [...prev, moveName]);
        setMoveSearch("");
    };

    const handleRemoveMove = (moveName) => {
        setMoves((prev) => prev.filter((m) => m !== moveName));
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.modalTitle}>
                        {details
                            ? `#${String(details.id).padStart(3, "0")} ${details.name.charAt(0).toUpperCase() + details.name.slice(1)}`
                            : "Seleccionar Pokémon"}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose} type="button">
                        <BiX size={18} />
                    </button>
                </div>

                <div className={styles.body}>
                    {/* ── Búsqueda de especie ── */}
                    <div className={styles.speciesSearch}>
                        <input
                            className={styles.searchInput}
                            placeholder="Buscar Pokémon..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <div className={styles.searchResults}>
                                {filteredSpecies.map((s) => (
                                    <button
                                        key={s.name}
                                        className={`${styles.searchItem} ${
                                            s.name === selectedSpecies ? styles.searchActive : ""
                                        }`}
                                        onClick={() => handleSelectSpecies(s.name)}
                                        type="button"
                                    >
                                        #{String(s.id).padStart(3, "0")} {s.nameEs}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {isLoading && <p className={styles.loading}>Cargando datos...</p>}

                    {details && !isLoading && (
                        <>
                            {/* ── Info básica ── */}
                            <div className={styles.infoRow}>
                                <img
                                    src={details.sprite}
                                    alt={details.name}
                                    className={styles.sprite}
                                    decoding="async"
                                />
                                <div className={styles.typeList}>
                                    {details.types.map((t) => (
                                        <span
                                            key={t}
                                            className={styles.typeBadge}
                                            style={{ background: TYPE_COLORS[t] || "#999" }}
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <label className={styles.shinyToggle}>
                                    <input
                                        type="checkbox"
                                        checked={shiny}
                                        onChange={(e) => setShiny(e.target.checked)}
                                    />
                                    <BiDiamond size={14} /> Shiny
                                </label>
                            </div>

                            {/* ── Habilidad ── */}
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>Habilidad</h4>
                                <select
                                    className={styles.select}
                                    value={ability}
                                    onChange={(e) => setAbility(e.target.value)}
                                >
                                    <option value="">Seleccionar habilidad</option>
                                    {details.abilities.map((a) => (
                                        <option key={a.name} value={a.name}>
                                            {a.nameEs} {a.isHidden ? "(oculta)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ── Movimientos ── */}
                            <div className={styles.section}>
                                <h4 className={styles.sectionTitle}>
                                    Movimientos ({moves.length}/4)
                                </h4>
                                <div className={styles.moveSlots}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className={styles.moveSlot}>
                                            {moves[i] ? (
                                                <span className={styles.moveChip}>
                                                    {moves[i]
                                                        .replace(/-/g, " ")
                                                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                                                    <button
                                                        className={styles.moveRemove}
                                                        onClick={() => handleRemoveMove(moves[i])}
                                                        type="button"
                                                    >
                                                        <BiX size={14} />
                                                    </button>
                                                </span>
                                            ) : (
                                                <span className={styles.moveEmpty}>Vacío</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {moves.length < 4 && (
                                    <div className={styles.moveSearchBox}>
                                        <p className={styles.moveHint}>
                                            Solo movimientos que{" "}
                                            {details.name.charAt(0).toUpperCase() +
                                                details.name.slice(1)}{" "}
                                            puede aprender ({learnableMoves.length} disponibles)
                                        </p>
                                        <input
                                            className={styles.searchInput}
                                            placeholder="Buscar movimiento..."
                                            value={moveSearch}
                                            onChange={(e) => setMoveSearch(e.target.value)}
                                        />
                                        {moveSearch && (
                                            <div className={styles.searchResults}>
                                                {filteredMoves.map((mn) => (
                                                    <button
                                                        key={mn}
                                                        className={`${styles.searchItem} ${
                                                            moves.includes(mn) ? styles.searchActive : ""
                                                        }`}
                                                        onClick={() => handleAddMove(mn)}
                                                        type="button"
                                                        disabled={moves.includes(mn)}
                                                    >
                                                        {mn.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                                    </button>
                                                ))}
                                                {filteredMoves.length === 0 && (
                                                    <p className={styles.noResults}>Sin resultados</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Stats ── */}
                            <StatsEditor
                                baseStats={details.stats}
                                ivs={ivs}
                                evs={evs}
                                nature={nature}
                                level={level}
                                onChangeIvs={setIvs}
                                onChangeEvs={setEvs}
                                onChangeNature={setNature}
                                onChangeLevel={setLevel}
                            />
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose} type="button">
                        Cancelar
                    </button>
                    <button
                        className={styles.saveBtn}
                        onClick={handleSave}
                        disabled={!details}
                        type="button"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
