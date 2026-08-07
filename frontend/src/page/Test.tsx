import StatusModal from "../components/ui/StatusModal";
import { MdError } from "react-icons/md";

export default function Test() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <StatusModal
        heading="Login failed!"
        button_name="Close"
        button_color="bg-[#a61124]"
        description="Incorrect username or password. Please try again"
        icon={<MdError size={54} color="#a61124" />}
      />
    </div>
  );
}
