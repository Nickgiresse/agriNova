import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <div className="h-full ">
      <header>
        <Navbar/>
      </header>
    </div>
  );
}
