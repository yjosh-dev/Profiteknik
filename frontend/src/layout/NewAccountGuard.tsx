import { Navigate, Outlet } from "react-router-dom";
import { UseAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function NewAccountGuard() {
  const navigate = useNavigate();
  const { userData } = UseAuth();
  if(!userData){
    return;
  }

  if(userData.userData.isNew == true){
     navigate("/applicant/complete-account-info")
  }

  return <Outlet />;
}