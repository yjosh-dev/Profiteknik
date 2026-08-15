type TooltipType = {
  type: "vertical" | "horizontal";
  text: string;
};

export default function Tooltip({ type, text }: TooltipType) {
  const renderTooltip = () => {
    switch (type) {
      case "vertical":
        return <VerticalTooltip text={text} />;

      case "horizontal":
        return <HorizontalTooltip text={text} />;
    }
  };

  return renderTooltip();
}

function VerticalTooltip({ text }: { text: string }) {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="h-0 w-0 border-x-12 border-x-transparent border-b-17 border-b-gray-900" />
      <div className="w-28 h-13 bg-gray-900 rounded-md flex justify-center items-center">
        <p className="font-base text-base tracking-wide text-white">{text}</p>
      </div>
    </div>
  );
}

function HorizontalTooltip({ text }: { text: string }) {
  return (
    <div className="flex justify-center items-center">
      <div className="flex items-center gap-0">
        <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-15 border-r-gray-900" />

        <div className="min-w-32 rounded-lg bg-gray-900 px-4 py-2.5 shadow-lg flex justify-center items-center">
          <p className="text-sm font-medium tracking-wide text-white">{text}</p>
        </div>
      </div>
    </div>
  );
}
