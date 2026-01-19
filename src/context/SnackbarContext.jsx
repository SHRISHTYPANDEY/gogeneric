import { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "../components/Snackbar";

const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const [snacks, setSnacks] = useState([]);

  const showSnackbar = useCallback(
    ({ message, actionText, onAction, duration = 3000 }) => {
      const id = Date.now();
      setSnacks((prev) => [...prev, { id, message, actionText, onAction }]);

      setTimeout(() => {
        setSnacks((prev) => prev.filter((s) => s.id !== id));
      }, duration);
    },
    []
  );

  const removeSnackbar = (id) => {
    setSnacks((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div className="snackbar-stack">
        {snacks.map((snack) => (
          <Snackbar
            key={snack.id}
            {...snack}
            onClose={() => removeSnackbar(snack.id)}
          />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
