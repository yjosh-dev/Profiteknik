import { createContext, useContext, useEffect, useState } from "react";

export type UserType = {
    name: string,
    id: string,
    role: string
}

export type AuthDataType = {
  user?: {name: string, id: string, role: string}
} | null;

type AuthContextType = {
  authData: AuthDataType;
  setAuthData: React.Dispatch<React.SetStateAction<AuthDataType>>;
};

type AuthProviderType = {
  children: React.ReactNode;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export default function AuthProvider({ children }: AuthProviderType) {
  const [authData, setAuthData] = useState<AuthDataType>(null);
  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function UseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context
}

