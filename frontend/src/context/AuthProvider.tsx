import { createContext, useEffect, useState } from "react";
import { rootAuth } from "../service/api/auth/rootAuth";
import { employeeAuth } from "../service/api/auth/employeeAuth";
import { ApplicantAuth } from "../service/api/auth/applicantAuth";

type UserType = {
  userData: {
    name: string;
    role: string;
    id: string;
    profile_image?: string;
    isNew?: boolean;
  };
} | null;

type AuthContextType = {
  userData: UserType;
  setUserData: React.Dispatch<React.SetStateAction<UserType>>;
  loading: boolean;
  unauthenticated: boolean;
  checkAuth: (verifyType: string) => Promise<void>;
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

  const verifyRoot = async (token: string) => {
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
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      setUnauthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmployee = async (token: string) => {
    try {
      const verify = await employeeAuth.verifyEmployee(token);
      setUserData({
        userData: {
          name: `${verify.data.first_name} ${verify.data.last_name}`,
          id: verify.data.id,
          role: verify.data.role,
          profile_image: verify.data.profile_image,
        },
      });
      setUnauthenticated(false);
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      setUnauthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyApplicant = async (token: string) => {
    try {
      const verify = await ApplicantAuth.me(token);
      setUserData({
        userData: {
          name: `${verify.data.first_name} ${verify.data.last_name}`,
          id: verify.data.id,
          role: verify.data.role ?? "applicant",
          isNew: verify.data.isNew,
          profile_image: verify.data.profile_image,
        },
      });
      setUnauthenticated(false);
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      setUnauthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async (verifyType: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUnauthenticated(true);
      return;
    }

    switch (verifyType) {
      case "root":
        verifyRoot(token);
        break;

      case "employee":
        verifyEmployee(token);
        break;

      case "applicant":
        verifyApplicant(token);
        break;

      default:
        setLoading(false);
        setUnauthenticated(true);
    }
  };

  useEffect(() => {
    const verifyType = localStorage.getItem("verify_type");
    checkAuth(verifyType ? verifyType : "root"); // pass whichever verifyType makes sense on initial load
  }, []);

  return (
    <AuthContext.Provider
      value={{ userData, setUserData, loading, checkAuth, unauthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
