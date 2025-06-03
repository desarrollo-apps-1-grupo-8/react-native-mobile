import { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
  userId: number | null;
  setUserId: (id: number | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ token, setToken, userId, setUserId, role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 