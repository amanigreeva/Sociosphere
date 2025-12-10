import { createContext, useReducer, useEffect } from "react";

const INITIAL_STATE = {
    darkMode: JSON.parse(localStorage.getItem("darkMode")) ?? true,
};

export const ThemeContext = createContext(INITIAL_STATE);

const ThemeReducer = (state, action) => {
    switch (action.type) {
        case "TOGGLE":
            return { darkMode: !state.darkMode };
        default:
            return state;
    }
};

export const ThemeContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ThemeReducer, INITIAL_STATE);

    useEffect(() => {
        localStorage.setItem("darkMode", state.darkMode);
        if (state.darkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
    }, [state.darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode: state.darkMode, dispatch }}>
            {children}
        </ThemeContext.Provider>
    );
};
