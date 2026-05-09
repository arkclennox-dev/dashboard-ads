"use client";

interface Props {
  text: string;
  type: "whatsapp" | "link" | "scroll";
  value: string;
  themeColor: string;
}

export function StickyCtaButton({ text, type, value, themeColor }: Props) {
  function handleClick() {
    if (type === "scroll") {
      document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
    } else if (type === "whatsapp") {
      const n = value.replace(/\D/g, "");
      window.open(`https://wa.me/${n}`, "_blank");
    } else if (type === "link" && value) {
      window.open(value, "_blank");
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white/90 to-transparent">
      <button
        onClick={handleClick}
        className="mx-auto block w-full max-w-sm rounded-xl py-4 text-base font-bold text-white shadow-xl transition hover:opacity-90"
        style={{ backgroundColor: themeColor }}
      >
        {text}
      </button>
    </div>
  );
}
