import { useState, useEffect, useMemo, useCallback } from "react";
import { usePokemonList } from "../hooks/usePokemonList";
import { usePokemonBatch } from "../hooks/usePokemonBatch";
import { useTypeFilter } from "../hooks/useTypeFilter";
import { useSpanishNameMap } from "../hooks/useSpanishNameMap";
import { useFilter } from "../../../context/FilterContext";
import PokemonSearch from "../components/PokemonSearch";
import PokemonList from "../components/PokemonList";
import PokemonsFilter from "../components/PokemonsFilter";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./HomePage.module.css";

const GENERATIONS = {
    gen1: [1, 151],
    gen2: [152, 251],
    gen3: [252, 386],
    gen4: [387, 493],
    gen5: [494, 649],
    gen6: [650, 721],
    gen7: [722, 809],
    gen8: [810, 905],
    gen9: [906, 1025],
};

export default function HomePage() {
    const { generation } = useFilter();
    const [search, setSearch] = useState("");
    const [types, setTypes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showForms, setShowForms] = useState(() => {
        try { return localStorage.getItem("pokedex_showForms") === "true"; }
        catch { return false; }
    });
    const pageSize = 20;

    // ---- 1. Lista base: solo nombres e IDs (1 llamada API) ----
    const {
        data: allPokemon = [],
        isLoading: listLoading,
        isError: listError,
    } = usePokemonList(showForms);

    // Mapa de nombres español → inglés para buscar en ambos idiomas
    const { data: spanishNameMap = {} } = useSpanishNameMap();

    // Persistir toggle de formas en localStorage
    useEffect(() => {
        try { localStorage.setItem("pokedex_showForms", showForms); }
        catch { /* ignorar */ }
    }, [showForms]);

    // Resetear página al cambiar filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [generation, search, types, showForms]);

    // ---- 2. Filtro por tipo mediante PokeAPI (0-2 llamadas) ----
    const {
        data: typeFilteredNames,
        isLoading: typeLoading,
        isError: typeError,
    } = useTypeFilter(types);

    // ---- 3. Filtros locales (nombre + generación) ----
    const localFiltered = useMemo(() => {
        let result = allPokemon;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter((p) => {
                // Buscar en nombre inglés
                if (p.name.includes(q)) return true;
                // Buscar en nombre español (si lo tenemos)
                const spanish = spanishNameMap[p.name];
                return spanish && spanish.includes(q);
            });
        }

        if (generation) {
            const [min, max] = GENERATIONS[generation];
            result = result.filter((p) => p.id >= min && p.id <= max);
        }

        return result;
    }, [allPokemon, search, generation]);

    // ---- 4. Aplicar filtro de tipos (si activo) ----
    const filtered = useMemo(() => {
        if (types.length === 0) return localFiltered;
        if (!typeFilteredNames) return []; // todavía cargando
        return localFiltered.filter((p) => typeFilteredNames.includes(p.name));
    }, [localFiltered, types, typeFilteredNames]);

    // ---- 5. Paginación ----
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const start = (currentPage - 1) * pageSize;
    const pageIds = filtered.slice(start, start + pageSize).map((p) => p.id);

    // ---- 6. Detalles solo del lote visible (~1-20 llamadas) ----
    const {
        data: pageData = [],
        isLoading: detailsLoading,
        isFetching: detailsFetching,
    } = usePokemonBatch(pageIds);

    // ---- Loading states ----
    const isLoading = listLoading || (types.length > 0 && typeLoading);
    const isError = listError || typeError;

    // Contar formas para mostrar en la UI
    const formsCount = useMemo(() => {
        if (!showForms) return 0;
        return allPokemon.filter((p) => p.isForm).length;
    }, [allPokemon, showForms]);

    // ---- Handlers ----
    const handleSearch = useCallback((value) => {
        setSearch(value);
    }, []);

    const handleTypesChange = useCallback((newTypes) => {
        setTypes(newTypes);
    }, []);

    const handleToggleForms = useCallback(() => {
        setShowForms((prev) => !prev);
    }, []);

    // ---- Render ----
    if (listLoading) return <Loader />;
    if (listError) return <ErrorMessage message="Error cargando la lista de Pokémon" />;

    return (
        <div className={styles.wrapper}>
            <PokemonSearch onSearch={handleSearch} />

            <div className={styles.filters}>
                <PokemonsFilter selectedTypes={types} onChange={handleTypesChange} />
            </div>

            {/* Toggle de formas alternativas */}
            <div className={styles.formsToggleBar}>
                <label
                    className={styles.formsToggle}
                    onClick={handleToggleForms}
                >
                    <span className={styles.formsToggleLabel}>
                        Mostrar formas alternativas
                        {showForms && formsCount > 0 && (
                            <span className={styles.formsCount}>({formsCount} formas)</span>
                        )}
                    </span>
                    <div
                        className={`${styles.toggleSwitch} ${showForms ? styles.toggleSwitchActive : ""}`}
                        role="switch"
                        aria-checked={showForms}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleToggleForms();
                            }
                        }}
                    >
                        <div className={styles.toggleSlider} />
                    </div>
                </label>
            </div>

            {types.length > 0 && typeLoading && (
                <Loader />
            )}

            {!typeLoading && (
                <>
                    <PokemonList
                        data={pageData}
                        isLoading={detailsLoading && pageData.length === 0}
                        isFetching={detailsFetching && pageData.length > 0}
                        isError={isError && pageData.length === 0}
                    />

                    {filtered.length > 0 && (
                        <div className={styles.pagination}>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                Anterior
                            </button>

                            <span>
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}

                    {filtered.length === 0 && !detailsLoading && (
                        <ErrorMessage message="No se encontraron Pokémon con esos filtros" />
                    )}
                </>
            )}
        </div>
    );
}
