import ThemeToggle from "./ThemeToggle";
import { Toaster } from "sonner";

export default function Header() {
  return (
    <header className="flex items-center flex-start p-2" style={{height: '50px'}}>
      <Toaster position="top-center" />
      <ThemeToggle />
    </header>
  );
}