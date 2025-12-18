import { Link as WouterLink } from "wouter";
import { isOfflineMode } from "./useHashLocation";
import { ReactNode } from "react";

interface OfflineLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function Link({ href, children, className, "data-testid": testId }: OfflineLinkProps) {
  const offline = isOfflineMode();
  
  if (offline) {
    return (
      <a 
        href={`#${href}`}
        className={className}
        data-testid={testId}
      >
        {children}
      </a>
    );
  }
  
  return (
    <WouterLink href={href} className={className} data-testid={testId}>
      {children}
    </WouterLink>
  );
}
