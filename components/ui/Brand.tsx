import Link from "next/link";
import { Asterisk } from "lucide-react";
export default function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Mousa home">
      <span className="brand-mark" aria-hidden="true">
        <Asterisk size={25} strokeWidth={1.5} />
      </span>
      mousa<span style={{ color: "var(--violet)" }}>.</span>
    </Link>
  );
}
