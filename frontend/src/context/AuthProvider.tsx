import { createContext, useEffect, useState } from "react";
import { rootAuth } from "../service/api/auth/rootAuth";

type UserType = {
  userData: { name: string; role: string; id: string };
} | null;

type AuthContextType = {
  userData: UserType;
  setUserData: React.Dispatch<React.SetStateAction<UserType>>;
  loading: boolean;
  unauthenticated: boolean;
  checkAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUnauthenticated(true);
      return;
    }
    try {
      const verify = await rootAuth.verifyRoot(token);
      setUserData({
        userData: {
          name: `${verify.data.first_name} ${verify.data.last_name}`,
          id: verify.data.id,
          role: verify.data.role,
        },
      });
      setUnauthenticated(false);
      setLoading(false);
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      setUnauthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userData, setUserData, loading, checkAuth, unauthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
