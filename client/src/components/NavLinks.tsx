import { Link } from "wouter";
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useNavContext } from "@/contexts/NavContext";

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
  const { previousPosition, setPreviousPosition } = useNavContext();
  
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(
    previousPosition
  );
  const [shouldAnimate, setShouldAnimate] = useState(!!previousPosition);

  useLayoutEffect(() => {
    const activeEl = itemRefs.current.get(currentPage);
    const container = containerRef.current;
    
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      
      const newPosition = {
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      };
      
      // If we have a previous position, animate from it
      if (previousPosition && !indicatorStyle) {
        setIndicatorStyle(previousPosition);
        // Use requestAnimationFrame to ensure the initial position is rendered first
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setShouldAnimate(true);
            setIndicatorStyle(newPosition);
          });
        });
      } else {
        setIndicatorStyle(newPosition);
        if (!shouldAnimate) {
          requestAnimationFrame(() => setShouldAnimate(true));
        }
      }
      
      // Save current position for next navigation
      setPreviousPosition(newPosition);
    }
  }, [currentPage]);

  // Handle resize
  useEffect(() => {
    const updatePosition = () => {
      const activeEl = itemRefs.current.get(currentPage);
      const container = containerRef.current;
      
      if (activeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        
        const newPosition = {
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        };
        
        setIndicatorStyle(newPosition);
        setPreviousPosition(newPosition);
      }
    };
    
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [currentPage, setPreviousPosition]);

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
      {indicatorStyle && (
        <span
          className={`absolute bottom-0 h-0.5 bg-primary rounded-full ${
            shouldAnimate ? "transition-all duration-300 ease-out" : ""
          }`}
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      )}
    </div>
  );
}
