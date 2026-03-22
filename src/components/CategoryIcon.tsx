"use client";

interface CategoryIconProps {
  category: string;
  className?: string;
}

export function CategoryIcon({ category, className = "w-4 h-4" }: CategoryIconProps) {
  switch (category) {
    case "Bitcoin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.88 14.24c-.34 1.28-1.7 1.86-3.22 1.57l-.32 1.24-.78-.2.31-1.22c-.2-.05-.41-.11-.62-.17l-.31 1.23-.78-.2.32-1.24c-.17-.05-.34-.09-.51-.14l-1.01-.26.4-.88s.58.16.57.15c.32.08.46-.13.52-.26l.5-1.96.08.02-.08-.02.7-2.76c.02-.18-.04-.42-.38-.5.01-.01-.57-.14-.57-.14l.2-.84.99.25c.11.03.22.05.33.08l.31-1.24.78.2-.31 1.21c.21.05.42.1.62.15l.31-1.21.78.2-.32 1.24c1.34.37 2.3.89 2.12 2.01-.14.9-.68 1.3-1.33 1.4.52.24.87.72.73 1.47zm-1.04-1.11c.14-.88-.67-1.12-1.49-1.33l-.37 1.47c.6.15 1.72.44 1.86-.14zm-.5-2.36c.12-.78-.55-1-1.23-1.17l-.34 1.33c.5.13 1.44.38 1.57-.16z" />
        </svg>
      );
    case "Ethereum":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 1.5l-7 11.5L12 17l7-4L12 1.5zM5 14.5L12 22.5l7-8L12 18.5l-7-4z" />
        </svg>
      );
    case "DeFi":
    case "DeFi Protocol":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8M12 8v8" strokeLinecap="round" />
        </svg>
      );
    case "NFTs":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 15l5-5 4 4 4-6 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Regulation":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 21h18M12 3l9 4v2H3V7l9-4zM5 9v9h2V9M10 9v9h2V9M15 9v9h2V9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Memecoins":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1-1 1-1 1 1-1 1zm4 0l-1-1 1-1 1 1-1 1zm-2-3c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4zm0-2c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
        </svg>
      );
    default:
      return null;
  }
}
