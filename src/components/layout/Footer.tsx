import { Building2, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading text-lg font-semibold">
                REI<span className="text-saffron">Pro</span>
              </span>
            </div>
            <p className="text-sm text-cream-dark/70 leading-relaxed">
              Professional real estate investment analysis with AI-powered
              insights. Make data-driven property decisions.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-saffron">
              Product
            </h3>
            <ul className="space-y-2 text-sm text-cream-dark/70">
              <li><a href="#features" className="transition-colors hover:text-cream cursor-pointer">Features</a></li>
              <li><a href="#valuation" className="transition-colors hover:text-cream cursor-pointer">Image Valuation</a></li>
              <li><a href="#analyzer" className="transition-colors hover:text-cream cursor-pointer">Property Analyzer</a></li>
              <li><a href="#how-it-works" className="transition-colors hover:text-cream cursor-pointer">How It Works</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-saffron">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-cream-dark/70">
              <li><a href="/privacy" className="transition-colors hover:text-cream cursor-pointer">Privacy Policy</a></li>
              <li><a href="/terms" className="transition-colors hover:text-cream cursor-pointer">Terms &amp; Conditions</a></li>
              <li><a href="#analyzer" className="transition-colors hover:text-cream cursor-pointer">Investment Disclaimer</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-saffron">
              Connect
            </h3>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-cream-dark/70 transition-colors hover:bg-primary hover:text-white cursor-pointer"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-cream-dark/50">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <span>
              &copy; {new Date().getFullYear()} REIPro. All rights reserved.
            </span>
            <div className="flex gap-4">
              <a href="/privacy" className="transition-colors hover:text-cream">Privacy</a>
              <a href="/terms" className="transition-colors hover:text-cream">Terms</a>
            </div>
          </div>
          <p className="mt-3 text-center text-cream-dark/40 leading-relaxed">
            REIPro is an analytical tool for informational purposes only. It does not constitute financial, investment, or legal advice.
            Always consult qualified professionals before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
