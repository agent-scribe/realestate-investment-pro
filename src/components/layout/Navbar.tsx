"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Menu,
  X,
  BarChart3,
  Shield,
  Calculator,
  Camera,
} from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features", icon: BarChart3 },
  { href: "#valuation", label: "Image Valuation", icon: Camera },
  { href: "#analyzer", label: "Analyzer", icon: Calculator },
  { href: "#how-it-works", label: "How It Works", icon: Shield },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-warm-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-900">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-brand-950">
            REI<span className="text-brand-700">Pro</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-brand-700 transition-colors duration-200 hover:text-brand-950 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#analyzer"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-800 cursor-pointer"
          >
            Analyze Property
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-950 md:hidden cursor-pointer"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-warm-50 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-950 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#analyzer"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              Analyze Property
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
