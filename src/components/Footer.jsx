import {
    Github,
    Twitter,
    Linkedin,
    Music2,
    Heart,
    Radio,
    Share2,
    Headphones
} from "lucide-react"

export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-[#282828] bg-gradient-to-b from-black to-[#121212]">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <span className="flex items-center space-x-2 text-xl lg:text-2xl font-bold">
                            <span className="text-[#1DB954]">Vibe</span>
                            <span className="text-white">Check</span>
                        </span>
                        <p className="text-gray-400 mb-4">
                            Creating personalized playlists based on your location, weather, and mood.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://x.com/lakshh__" className="text-gray-400 hover:text-[#1DB954] transition-all duration-300">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://github.com/21lakshh" className="text-gray-400 hover:text-[#1DB954] transition-all duration-300">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/lakshya-paliwal-67a5222aa" className="text-gray-400 hover:text-[#1DB954] transition-all duration-300">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                    {[
                        {
                            title: "Features",
                            links: [
                                { text: "Location Based", icon: <Radio className="w-4 h-4" /> },
                                { text: "Weather Integration", icon: <Music2 className="w-4 h-4" /> },
                                { text: "Mood Selection", icon: <Heart className="w-4 h-4" /> },
                                { text: "Spotify Connect", icon: <Headphones className="w-4 h-4" /> }
                            ],
                        },
                        {
                            title: "About",
                            links: [
                                { text: "How it Works", icon: null },
                                { text: "Technology", icon: null },
                                { text: "Developer Blog", icon: null },
                                { text: "Updates", icon: null }
                            ],
                        },
                        {
                            title: "Support",
                            links: [
                                { text: "Help Center", icon: null },
                                { text: "Contact Us", icon: null },
                                { text: "Privacy Policy", icon: null },
                                { text: "Terms of Service", icon: null }
                            ],
                        },
                    ].map((section, index) => (
                        <div key={index}>
                            <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                            <ul className="space-y-2 text-gray-400">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a
                                            href="#"
                                            className="hover:text-[#1DB954] transition-colors duration-300 flex items-center gap-2 group"
                                        >
                                            {link.icon && <span className="group-hover:text-[#1DB954] transition-colors duration-300">{link.icon}</span>}
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-[#282828] pt-8 text-center">
                    <p className="text-gray-400">
                        &copy; {new Date().getFullYear()} VibeCheck. Built with 
                        <span className="text-[#1DB954] mx-1">♪</span> 
                        by 
                        <a href="https://github.com/21lakshh" className="text-[#1DB954] hover:text-white transition-colors duration-300 ml-1">
                            Unorthodox
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    )
}