import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import {
  useGetAllFareConfigsQuery,
  useDeleteFareConfigMutation,
} from "../../map/admin-slice/fareSlice";
import { useToast } from "../../components/ui/use-toast";
import FareHeader from "../../components/admin-view/admin-fare/FareHeader";
import FareTable from "../../components/admin-view/admin-fare/FareTable";
import FareModal from "../../components/admin-view/admin-fare/FareModal";

const FareConfigPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  const { data: fareConfigs, isLoading, error } = useGetAllFareConfigsQuery();
  const [deleteFareConfig] = useDeleteFareConfigMutation();
  const { toast } = useToast();

  const handleEdit = (config) => {
    setEditingConfig(config);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this fare estimation?")
    ) {
      try {
        await deleteFareConfig(id).unwrap();
        toast({
          title: "Success",
          description: "Fare Estimation deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.data?.error || "Failed to delete fare estimation",
          variant: "destructive",
        });
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingConfig(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading fare estimation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">
          Error loading fare estimations
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-1">
      <Card>
        <FareHeader onAddFare={handleCreate} />
        <CardContent>
          <FareTable
            fareConfigs={fareConfigs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <FareModal
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        editingConfig={editingConfig}
        onSuccess={handleDialogClose}
      />
    </div>
  );
};

export default FareConfigPage;
