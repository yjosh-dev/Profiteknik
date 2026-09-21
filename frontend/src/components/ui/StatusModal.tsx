import Button from "./Button";
import Card from "./Card";

type ModalProps = {
  heading: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  button_name: string;
  button_color: string;
};

//sample usage
// <StatusModal
//    heading="Invalid or expired token"
//    description="Your token is invalid or expired. Please try to login again" button_name="Hello"
//    icon={<MdError/>}
//    button_color="red"
// />

export default function StatusModal({
  heading,
  description,
  icon,
  onClick,
  button_name,
  button_color,
}: ModalProps) {
  return (
    <Card className="py-8 px-8 gap-4 max-w-sm border border-[#E3E0D8] bg-[#FAF9F6]">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#F1EFE9] text-2xl">
        {icon}
      </div>

      <h1 className=" text-2xl text-[#1C2321] text-center leading-tight">
        {heading}
      </h1>

      <p className="archivo text-sm text-[#6B6F76] max-w-[85%] text-center leading-relaxed">
        {description}
      </p>

      <Button
        onClick={onClick}
        className={`archivo mt-2 px-14 py-2.5 text-sm font-medium rounded-md ${button_color}`}
      >
        {button_name}
      </Button>
    </Card>
  );
}