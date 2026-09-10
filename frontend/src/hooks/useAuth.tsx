import { AuthContext } from "../context/AuthProvider";
import { useContext } from "react";

export function UseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context
}