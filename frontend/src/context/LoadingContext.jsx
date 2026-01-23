import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}

      {/* Global Loader UI */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded shadow text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
            <p className="text-sm font-semibold">Please wait…</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
