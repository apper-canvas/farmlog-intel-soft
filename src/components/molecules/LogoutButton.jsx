import React from 'react';
import { useAuth } from '@/layouts/Root';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <ApperIcon name="LogOut" className="w-4 h-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;