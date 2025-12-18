import { Link, useLocation } from "wouter";

interface NavLinksProps {
  currentPage: "wizard" | "flowchart" | "browse";
}

const navItems = [
  { id: "wizard", label: "Wizard", href: "/wizard" },
  { id: "flowchart", label: "Flowchart", href: "/flowchart" },
  { id: "browse", label: "Browse", href: "/tests" },
] as const;

export function NavLinks({ currentPage }: NavLinksProps) {
  return (
    <div className="flex items-center gap-1 relative">
      {navItems.map((item) => {
        const isActive = item.id === currentPage;
        return (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`nav-${item.id}`}
            className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
            <span
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out ${
                isActive ? "w-[calc(100%-12px)]" : "w-0"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
