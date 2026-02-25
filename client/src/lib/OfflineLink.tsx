import { Link as WouterLink } from "wouter";
import React, { ReactNode, forwardRef } from "react";

interface OfflineLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}

// Check at module load time - replaced at build time for offline builds
const IS_OFFLINE = import.meta.env.VITE_OFFLINE_MODE === "true";

export const Link = forwardRef<HTMLAnchorElement, OfflineLinkProps>(
  ({ href, children, className, "data-testid": testId, ...props }, ref) => {
    // In offline mode (hash routing), wouter's Link already works correctly
    // because the Router is configured with useHashLocation
    // The Link component just needs to use the regular href and wouter handles the hash
    return (
      <WouterLink
        href={href}
        className={className}
        data-testid={testId}
        ref={ref as any}
        {...props}
      >
        {children}
      </WouterLink>
    );
  }
);
