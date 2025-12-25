import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PreferencesContextType {
    showTrendChart: boolean;
    setShowTrendChart: (show: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'spendwise_preferences';

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [showTrendChart, setShowTrendChartState] = useState<boolean>(true);

    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (typeof parsed.showTrendChart === 'boolean') {
                    setShowTrendChartState(parsed.showTrendChart);
                }
            } catch (e) {
                console.error("Failed to parse preferences", e);
            }
        }
    }, []);

    const setShowTrendChart = (show: boolean) => {
        setShowTrendChartState(show);
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        let newPrefs = { showTrendChart: show };
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                newPrefs = { ...parsed, showTrendChart: show };
            } catch (e) { }
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPrefs));
    };

    return (
        <PreferencesContext.Provider value={{ showTrendChart, setShowTrendChart }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}
