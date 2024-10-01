import React from "react";
import { useRouter } from "next/navigation";

const SidepanelItem = ({ Icon, value, page }) => {
  const router = useRouter();
  const handleNavigation = (path) => {
    router.push(path);
  };
  return (
    <div
      className="flex items-center space-x-2 py-3 pl-4 hover:bg-purple-200 rounded-l-xl cursor-pointer"
      onClick={() => handleNavigation(page)}
    >
      <Icon className="h-8 w-8 text-blue-500" />
      <p className="hidden sm:inline-flex font-medium">{value}</p>
    </div>
  );
};

export default SidepanelItem;
