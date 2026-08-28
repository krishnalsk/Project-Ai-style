import React from "react";

export function Card({ className = "", hover = false, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div className={`card ${hover ? "card-hover" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pb-3 ${className}`} {...props}>{children}</div>;
}
export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;
}
