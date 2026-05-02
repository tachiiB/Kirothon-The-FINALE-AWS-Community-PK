import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20 py-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-base">Kairos</span>
          <span>—</span>
          <span>Find Your Opportune Moment</span>
        </div>
        <span className="text-slate-600 text-xs">Emails are processed transiently by AI. Nothing is stored on our servers. © 2026 Kairos.</span>
        <a
          href="https://github.com/MuhammadSubhan404x/Kairos"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
        >
          <Github size={15} className="group-hover:text-white" />
          <span>github.com/MuhammadSubhan404x/Kairos</span>
        </a>
      </div>
    </footer>
  );
}
