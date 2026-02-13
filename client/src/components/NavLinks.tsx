import { Link } from "@/lib/OfflineLink";
import { useRef, useEffect, useState, useMemo } from "react";
import { useNavContext } from "@/contexts/NavContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavLinksProps {
  currentPage: "wizard" | "flowchart" | "browse" | "glossary" | "home";
}

const navItems = [
  { id: "wizard", label: "Wizard", href: "/wizard" },
  { id: "flowchart", label: "Flowchart", href: "/flowchart" },
  { id: "browse", label: "Browse", href: "/tests" },
  { id: "glossary", label: "Glossary", href: "/glossary" },
] as const;

export function NavLinks({ currentPage }: NavLinksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const { previousPosition, setPreviousPosition } = useNavContext();
  const isMobile = useIsMobile();
  
  const visibleNavItems = useMemo(() => {
    return navItems.filter(item => !isMobile || item.id !== "flowchart");
  }, [isMobile]);

  const [startPos, setStartPos] = useState<{ left: number; width: number } | null>(null);
  const [endPos, setEndPos] = useState<{ left: number; width: number } | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const measureActive = () => {
      const activeEl = itemRefs.current.get(currentPage);
      const container = containerRef.current;
      
      if (activeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        
        return {
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        };
      }
      return null;
    };

    // Small delay to ensure refs are populated
    const timer = setTimeout(() => {
      const newPos = measureActive();
      if (!newPos) return;

      if (previousPosition) {
        // We have a previous position - animate from there
        setStartPos(previousPosition);
        setEndPos(newPos);
        setAnimating(false);
        
        // Force a reflow, then start animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimating(true);
            setStartPos(newPos);
          });
        });
      } else {
        // First load - just show at current position
        setStartPos(newPos);
        setEndPos(newPos);
      }
      
      // Save for next navigation
      setPreviousPosition(newPos);
    }, 10);

    return () => clearTimeout(timer);
  }, [currentPage]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const activeEl = itemRefs.current.get(currentPage);
      const container = containerRef.current;
      
      if (activeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        
        const pos = {
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        };
        
        setStartPos(pos);
        setEndPos(pos);
        setPreviousPosition(pos);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentPage, setPreviousPosition]);

  const displayPos = startPos;

  return (
    <div ref={containerRef} className="flex items-center relative">
      {visibleNavItems.map((item) => {
        const isActive = item.id === currentPage;
        return (
          <span
            key={item.id}
            ref={(el: HTMLSpanElement | null) => {
              if (el) itemRefs.current.set(item.id, el);
            }}
          >
            <Link
              href={item.href}
              data-testid={`nav-${item.id}`}
              className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 inline-block ${
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          </span>
        );
      })}
      {displayPos && (
        <span
          className="absolute bottom-0 h-0.5 bg-primary rounded-full"
          style={{
            left: displayPos.left,
            width: displayPos.width,
            transition: animating ? 'left 300ms ease-out, width 300ms ease-out' : 'none',
          }}
        />
      )}
    </div>
  );
}
