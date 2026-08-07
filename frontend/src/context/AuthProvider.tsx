import { create } from "axios";
import React, { useState, createContext } from "react";

type AuthDataProps = {
  user: { name: string; id: string; role: string };
  token: string;
} | null;

type AuthContextProps = {
  authData: AuthDataProps;
  setAuthData: React.Dispatch<React.SetStateAction<AuthDataProps>>;
};

type AuthProviderContent = {
  children: React.ReactNode;
};

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

export default function AuthProvider({ children }: AuthProviderContent) {
  const [authData, setAuthData] = useState<AuthDataProps>(null);
  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}
