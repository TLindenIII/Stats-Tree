import { Link } from "wouter";
import { useRef, useEffect, useState } from "react";

interface NavLinksProps {
  currentPage: "wizard" | "flowchart" | "browse";
}

const navItems = [
  { id: "wizard", label: "Wizard", href: "/wizard" },
  { id: "flowchart", label: "Flowchart", href: "/flowchart" },
  { id: "browse", label: "Browse", href: "/tests" },
] as const;

export function NavLinks({ currentPage }: NavLinksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = itemRefs.current.get(currentPage);
      const container = containerRef.current;
      
      if (activeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        
        setIndicatorStyle({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        });
        
        if (!isInitialized) {
          requestAnimationFrame(() => setIsInitialized(true));
        }
      }
    };

    updateIndicator();
    
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [currentPage, isInitialized]);

  return (
    <div ref={containerRef} className="flex items-center relative">
      {navItems.map((item) => {
        const isActive = item.id === currentPage;
        return (
          <Link
            key={item.id}
            href={item.href}
            ref={(el: HTMLAnchorElement | null) => {
              if (el) itemRefs.current.set(item.id, el);
            }}
            data-testid={`nav-${item.id}`}
            className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      {isInitialized && (
        <span
          className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      )}
    </div>
  );
}
