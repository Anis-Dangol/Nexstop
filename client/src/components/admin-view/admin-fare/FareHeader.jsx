import React from "react";
import { Button } from "../../ui/button";
import { Plus } from "lucide-react";

const FareHeader = ({ onAddFare }) => {
  return (
    <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Fare Estimation</h1>
      </div>
      <Button onClick={onAddFare}>
        <Plus className="w-4 h-4 mr-2" />
        Add New Fare
      </Button>
    </div>
  );
};

export default FareHeader;
