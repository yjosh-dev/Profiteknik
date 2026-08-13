import { UseAuth } from "../../../context/AuthProvider";

const revokeToken = () => {
  const { setAuthData } = UseAuth();
  setAuthData(null);
  localStorage.removeItem("token");
};
