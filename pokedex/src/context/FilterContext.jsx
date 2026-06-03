import { createContext, useContext, useState } from "react";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
    const [generation, setGeneration] = useState(null);

    return (
        <FilterContext.Provider value={{ generation, setGeneration }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const ctx = useContext(FilterContext);
    if (!ctx) throw new Error("useFilter debe usarse dentro de FilterProvider");
    return ctx;
}
