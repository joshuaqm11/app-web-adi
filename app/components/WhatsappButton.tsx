import { MessageCircle } from "lucide-react";

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/50663940032?text=Hola,%20quisiera%20información%20sobre%20el%20cementerio%20comunal"
      target="_blank"
      className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition flex items-center justify-center z-50"
    >
      <MessageCircle size={28} />
    </a>
  );
}