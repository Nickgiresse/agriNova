import Link from "next/link"

export default function Navbar() {
    const navlink=[
        { label:"Accueil", href:"/" },
        { label:"Fonctionnalites", href:"Fonctionnalites" },
        { label:"Apropos", href:"Apropos"},
        { label:"Contact", href:"Contact"},


    ]
    return(
        <nav className="flex flex-row justify-between pl-7 pr-7 h-20 items-center">
            <h1 className="text-xl font-black text-green-900">AgriNova</h1>
            <div className="hidden md:flex gap-8 items-center text-stone-600">
                {navlink.map(({href,label})=>
                    <Link href={href} className="hover:font-bold transition-2 duration-2">
                        {label}
                    </Link>
                )}
            </div>
            <div>
                <button className="border-2 ">Se connecter</button>
                <button>S'inscrire</button>
            </div>
            
        </nav>
    )
}