import { Link } from 'react-router'
import { Pizza, Instagram, Twitter, Facebook, Mail, Phone } from 'lucide-react'

const LINKS = {
  Company: [
    { label: 'About Us', to: '/' },
    { label: 'Careers', to: '/' },
    { label: 'Blog', to: '/' },
  ],
  Order: [
    { label: 'Menu', to: '/menu' },
    { label: 'Track Order', to: '/orders' },
    { label: 'FAQs', to: '/' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2 text-xl font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <Pizza className="size-5" />
              </span>
              Pie<span className="text-primary">Rush</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Crafting the perfect slice since 2024. Fresh ingredients, bold flavors, delivered hot
              to your door.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-white transition-colors"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook className="size-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/70">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/70">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                support@pierush.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" />
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PieRush. All rights reserved. Made with ❤️ and lots of cheese.
        </div>
      </div>
    </footer>
  )
}
