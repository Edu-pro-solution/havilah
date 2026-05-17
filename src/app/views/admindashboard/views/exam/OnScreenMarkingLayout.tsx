import useFetch from "@/hooks/useFetch";
import React from "react";
import { Outlet } from "react-router-dom";

const OnScreenMarkingLayout = () => {
  useFetch("/sessions");

  return (
    <div className="w-full h-full">
      {/* This Outlet is where the Hub or the Workspaces will render */}
      <Outlet />
    </div>
  );
};

export default OnScreenMarkingLayout;
