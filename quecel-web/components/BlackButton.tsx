import Link from "next/link";
import { ReactNode } from "react";

export default function BlackButton({
  children,
  href,
}: {
  children?: ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <button className="btn ml-8 whitespace-nowrap inline-flex items-center justify-center bg-gradient-to-r bg-black bg-origin-border px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:bg-white hover:text-black hover:border-black">
        {children}
      </button>
    </Link>
  );
}
