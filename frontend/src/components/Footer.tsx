export default function Footer() {
  return (
    <footer className="px-4 lg:px-10 pb-6 lg:pb-8">
      <div className="mx-auto max-w-6xl">
        <div
          data-testid="legal-disclaimer"
          className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-ink-400"
        >
          Boston Soccer Passport is a local soccer guide concept. Official event details should be confirmed
          through official event organizers. Not affiliated with, endorsed by, or sponsored by FIFA, MLS,
          or the New England Revolution. Prototype built for the Hult International Business School
          consulting capstone (MGT-6080).
        </div>
      </div>
    </footer>
  );
}
