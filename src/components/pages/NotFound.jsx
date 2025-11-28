import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name="MapPinOff" className="w-12 h-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold text-gray-900">404</h1>
          <h2 className="text-xl font-display font-semibold text-gray-900">
            Field Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Looks like you've wandered off the beaten path. The page you're looking for doesn't exist in our fields.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate("/")} className="flex items-center gap-2">
            <ApperIcon name="Home" className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate("/farms")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="MapPin" className="w-4 h-4" />
            View Farms
          </Button>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Check out your farms, crops, and tasks from the main navigation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;