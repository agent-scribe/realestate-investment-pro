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
              <li><a href="#analyzer" className="transition-colors hover:text-cream cursor-pointer">Property Analyzer</a></li>
              <li><a href="#how-it-works" className="transition-colors hover:text-cream cursor-pointer">How It Works</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-saffron">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-cream-dark/70">
              <li><span className="cursor-default">API Documentation</span></li>
              <li><span className="cursor-default">Investment Guide</span></li>
              <li><span className="cursor-default">Market Reports</span></li>
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

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-cream-dark/50">
          &copy; {new Date().getFullYear()} REIPro. All rights reserved. Built
          with precision for real estate investors.
        </div>
      </div>
    </footer>
  );
}
