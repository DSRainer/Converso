import Image from "next/image";
import Link from "next/link";
import NavItems from "./NavItems";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <nav className="navbar">
      <Link href="/">
        <div className="flex flex-center gap-3 cursor-pointer">
          <Image src="/images/logo.svg" alt="logo" width={46} height={44} />
        </div>
      </Link>
      <div className="flex items-center gap-8">
        <NavItems />
        <Show when="signed-out">
          <SignInButton>
            <button className="bg-purple-700 text-white btn-signin">
              Sign In
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
};

export default Header;
