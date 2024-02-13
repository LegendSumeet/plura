import Navigation from "@/components/site/navbar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
        <Navigation/>
        {children}</div>
  );
};

export default Layout;
