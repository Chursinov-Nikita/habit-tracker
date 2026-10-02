import { User2 } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import Link from "next/link";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center px-3 pt-3">
      <Link
        href="/"
        className="flex w-fit items-center gap-2 justify-self-start rounded-full border border-white/10 bg-white/10 py-1 pl-3 pr-5 font-semibold tracking-tight text-white shadow-md shadow-black/20 backdrop-blur-xl transition duration-300 ease-out hover:scale-105 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
      >
        <Image src={logo} alt="" width={44} />
        <span>HabitTracker</span>
      </Link>

      <nav
        aria-label="Основная навигация"
        className="rounded-full border border-white/10 bg-white/10 p-1.5 shadow-md shadow-black/20 backdrop-blur-xl transition duration-300 ease-out hover:scale-102"
      >
        <ul className="flex flex-row items-center gap-1 font-semibold">
          <li>
            <Link
              href="/"
              className="block rounded-full px-4 py-2 text-white/70 transition duration-300 ease-out hover:scale-105 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/habits"
              className="block rounded-full px-4 py-2 text-white/70 transition duration-300 ease-out hover:scale-105 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
            >
              Habits
            </Link>
          </li>
          <li>
            <Link
              href="/calendar"
              className="block rounded-full px-4 py-2 text-white/70 transition duration-300 ease-out hover:scale-105 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
            >
              Calendar
            </Link>
          </li>
          <li>
            <Link
              href="/relax"
              className="block rounded-full px-4 py-2 text-white/70 transition duration-300 ease-out hover:scale-105 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
            >
              Relax
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="block rounded-full px-4 py-2 text-white/70 transition duration-300 ease-out hover:scale-105 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
            >
              About
            </Link>
          </li>
        </ul>
      </nav>

      <Link
        href="/profile"
        aria-label="Профиль"
        className="justify-self-end rounded-full border border-white/10 bg-white/10 p-3.5 text-white/80 shadow-md shadow-black/20 backdrop-blur-xl transition duration-300 ease-out hover:scale-105 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-95"
      >
        <User2 />
      </Link>
    </header>
  );
};

export default Header;
