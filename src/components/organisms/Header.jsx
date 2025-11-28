import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import farmService from "@/services/api/farmService";
import ApperIcon from "@/components/ApperIcon";
import OfflineIndicator from "@/components/molecules/OfflineIndicator";
import LogoutButton from "@/components/atoms/LogoutButton";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState("");

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
try {
      const data = await farmService.getAll();
      setFarms(data);
    } catch (error) {
      console.error("Error loading farms:", error);
    }
  };

  const navigation = [
    { name: "Dashboard", href: "", icon: "LayoutDashboard" },
    { name: "Farms", href: "farms", icon: "MapPin" },
    { name: "Crops", href: "crops", icon: "Sprout" },
    { name: "Tasks", href: "tasks", icon: "CheckSquare" },
    { name: "Expenses", href: "expenses", icon: "Receipt" },
  ];

  const NavItem = ({ item, mobile = false }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isActive
            ? "bg-primary text-white shadow-sm"
            : mobile
            ? "text-gray-700 hover:bg-primary/5 hover:text-primary"
            : "text-gray-600 hover:text-primary hover:bg-primary/5"
        }`
      }
      onClick={() => mobile && setIsMobileMenuOpen(false)}
    >
      <ApperIcon name={item.icon} className="w-5 h-5" />
      {item.name}
    </NavLink>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ApperIcon name="Sprout" className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-display font-bold text-gray-900">FarmLog</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navigation.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </nav>

            {/* Farm Selector & Status */}
            <div className="hidden md:flex items-center gap-4">
              {farms.length > 0 && (
                <select
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">All Farms</option>
{farms.map((farm) => (
                    <option key={farm.Id} value={farm.Id}>
                      {farm.Name}
                    </option>
                  ))}
                </select>
              )}
              <OfflineIndicator />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <ApperIcon name="Menu" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl md:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <ApperIcon name="Sprout" className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-display font-bold text-gray-900">FarmLog</h1>
                  </div>
                  <button
                    className="p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ApperIcon name="X" className="w-6 h-6" />
                  </button>
                </div>

{/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navigation.map((item) => (
                    <NavItem key={item.href} item={item} mobile />
                  ))}
                </nav>

{/* Logout Button */}
                <div className="p-4 border-t">
                  <LogoutButton />
                </div>

                {/* Status */}
                <div className="p-4 border-t border-gray-200">
                  <OfflineIndicator />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;