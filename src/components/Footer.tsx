import {
    FaGithub,
    FaLinkedin,
    FaEnvelope
} from "react-icons/fa";

export default function Footer() {

    return (
        <footer className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">

            <div className="mx-auto flex flex-wrap items-center gap-3 text-sm text-stone-500">

                <span>
                    Free to use
                </span>

                <span>
                    |
                </span>

                <span>
                    Local-only data
                </span>

                <span>
                    |
                </span>

                <div className="flex items-center gap-3">

                    <a
                        href="https://github.com/jimmycamangon"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="GitHub"
                        className="transition hover:text-stone-950"
                    >
                        <FaGithub className="h-4 w-4" />
                    </a>

                    <a
                        href="https://www.linkedin.com/in/camangon-jimmy-jr-b-b88003294/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="LinkedIn"
                        className="transition hover:text-stone-950"
                    >
                        <FaLinkedin className="h-4 w-4" />
                    </a>

                    <a
                        href="mailto:jimmycamangon121801@gmail.com"
                        aria-label="Email"
                        className="transition hover:text-stone-950"
                    >
                        <FaEnvelope className="h-4 w-4" />
                    </a>

                </div>

            </div>

        </footer>
    );
}