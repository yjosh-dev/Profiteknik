import Button from "./Button";
import Card from "./Card";

type ModalProps = {
  heading: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  button_name: string
  button_color: string
};

export default function StatusModal({
  heading,
  description,
  icon,
  onClick,
  button_name,
  button_color
}: ModalProps) {
  return (
    <Card className="py-5 gap-5 max-w-sm">
      {icon}
      <h1 className="font-bold text-2xl">{heading}</h1>
      <p className="text-base max-w-[60%] text-center ">{description}</p>
      <Button onClick={onClick} className={`px-14 py-2 rounded-xl ${button_color}`}>
        {button_name}
      </Button>
    </Card>
  );
}
