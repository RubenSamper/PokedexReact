import { useState, useEffect, useRef, useCallback } from "react";
import { useFilter } from "../../../context/FilterContext";
import styles from "./PokemonSearch.module.css";

const GEN_LABELS = {
    gen1: "Kanto",
    gen2: "Johto",
    gen3: "Hoenn",
    gen4: "Sinnoh",
    gen5: "Teselia",
    gen6: "Kalos",
    gen7: "Alola",
    gen8: "Galar",
    gen9: "Paldea",
};

export default function PokemonSearch({ onSearch }) {
    const [value, setValue] = useState("");
    const { generation, setGeneration } = useFilter();
    const inputRef = useRef(null);

    const clearAndFocus = useCallback(() => {
        setValue("");
        onSearch("");
        inputRef.current?.focus();
    }, [onSearch]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.code === "Space") {
                e.preventDefault();
                clearAndFocus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [clearAndFocus]);

    const handleChange = (e) => {
        const text = e.target.value;
        setValue(text);
        onSearch(text);
    };

    const handleGenChange = (e) => {
        setGeneration(e.target.value || null);
        e.target.blur();
        inputRef.current?.focus();
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.bar}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar Pokémon... (Ctrl+Espacio)"
                    value={value}
                    onChange={handleChange}
                    className={styles.input}
                />

                <select
                    className={styles.genSelect}
                    value={generation ?? ""}
                    onChange={handleGenChange}
                >
                    <option value="">Todas las gen.</option>
                    {Object.entries(GEN_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
