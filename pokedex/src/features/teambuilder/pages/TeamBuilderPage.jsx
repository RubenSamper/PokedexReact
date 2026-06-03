import { useState } from "react";
import { useTeams } from "../hooks/useTeams";
import { useAllSpecies } from "../hooks/usePokemonForBuilder";
import TeamSlot from "../components/TeamSlot";
import PokemonEditorModal from "../components/PokemonEditorModal";
import TeamAnalysisSummary from "../components/TeamAnalysisSummary";
import styles from "./TeamBuilderPage.module.css";

export default function TeamBuilderPage() {
    const {
        teams,
        activeTeam,
        activeId,
        setActiveId,
        addTeam,
        renameTeam,
        deleteTeam,
        updateSlot,
        clearSlot,
    } = useTeams();

    const { data: speciesList } = useAllSpecies();
    const [editingSlot, setEditingSlot] = useState(null); // index o null
    const [renaming, setRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState("");

    const handleRename = () => {
        if (!activeTeam) return;
        if (renaming) {
            const val = renameValue.trim();
            if (val) renameTeam(activeTeam.id, val);
            setRenaming(false);
        } else {
            setRenameValue(activeTeam.name);
            setRenaming(true);
        }
    };

    const filledSlots = activeTeam
        ? activeTeam.slots.filter((s) => s.species !== null).length
        : 0;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Prediseñar equipo</h2>

            {/* ── Barra de herramientas ── */}
            <div className={styles.toolbar}>
                <select
                    className={styles.teamSelect}
                    value={activeId || ""}
                    onChange={(e) => setActiveId(e.target.value)}
                >
                    {teams.length === 0 && (
                        <option value="">Sin equipos</option>
                    )}
                    {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>

                <button className={styles.btn} onClick={addTeam} type="button">
                    + Nuevo
                </button>

                {activeTeam && (
                    <>
                        {renaming ? (
                            <input
                                className={styles.renameInput}
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleRename()
                                }
                                autoFocus
                            />
                        ) : (
                            <button
                                className={styles.btn}
                                onClick={handleRename}
                                type="button"
                            >
                                Renombrar
                            </button>
                        )}
                        <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => {
                                if (
                                    confirm(
                                        `¿Eliminar "${activeTeam.name}"?`
                                    )
                                )
                                    deleteTeam(activeTeam.id);
                            }}
                            type="button"
                        >
                            Eliminar
                        </button>
                    </>
                )}
            </div>

            {!activeTeam ? (
                <p className={styles.empty}>
                    Crea un equipo para empezar
                </p>
            ) : (
                <>
                    {/* ── Slots ── */}
                    <div className={styles.slotsGrid}>
                        {activeTeam.slots.map((slot, i) => (
                            <TeamSlot
                                key={i}
                                slot={slot}
                                index={i}
                                onClick={() => setEditingSlot(i)}
                                onClear={() => clearSlot(activeTeam.id, i)}
                            />
                        ))}
                    </div>

                    {/* ── Análisis ── */}
                    {filledSlots > 0 && (
                        <TeamAnalysisSummary team={activeTeam} />
                    )}

                    {/* ── Modal editor ── */}
                    {editingSlot !== null && (
                        <PokemonEditorModal
                            slot={activeTeam.slots[editingSlot]}
                            speciesList={speciesList || []}
                            onSave={(data) => {
                                updateSlot(activeTeam.id, editingSlot, data);
                                setEditingSlot(null);
                            }}
                            onClose={() => setEditingSlot(null)}
                        />
                    )}
                </>
            )}
        </div>
    );
}
