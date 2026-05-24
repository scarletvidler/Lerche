import { Outlet } from "react-router";

export function Section({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`p-5 m-6 rounded-lg bg-gray-800/50 ${className}`}>
            {children}
        </div>
    );  
}