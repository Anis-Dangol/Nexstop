import React from "react";
import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Trash2, Edit } from "lucide-react";

const FareTable = ({ fareConfigs, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading fare estimations...</div>
      </div>
    );
  }

  if (fareConfigs?.data?.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No fare estimations found.</p>
        <p className="text-sm text-gray-400">
          Create your first fare estimation to get started.
        </p>
      </div>
    );
  }

  return (
    <Table className="bg-white rounded-lg shadow-sm p-2 mb-2 border font-normal">
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Distance Range (km)</TableHead>
          <TableHead className="font-bold">Fare Amount</TableHead>
          <TableHead className="font-bold">Description</TableHead>
          <TableHead className="font-bold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fareConfigs?.data?.map((config) => (
          <TableRow key={config._id}>
            <TableCell>
              {config.distanceRange.min} - {config.distanceRange.max}
            </TableCell>
            <TableCell>Rs. {config.fare}</TableCell>
            <TableCell>{config.description || "No description"}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white hover:text-white"
                  size="sm"
                  onClick={() => onEdit(config)}
                >
                  <Edit className="w-4 h-4" /> <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
                  size="sm"
                  onClick={() => onDelete(config._id)}
                >
                  <Trash2 className="w-4 h-4" /> <span>Delete</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FareTable;
