
import { Package2Icon } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white">
      <Link
        className="flex items-center gap-2 font-semibold"
        prefetch={true}
        href="/"
      >
        <Package2Icon className="h-6 w-6" />
        <span>Acme Store</span>
      </Link>
    </header>
  );
}
