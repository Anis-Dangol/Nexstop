import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  useGetAllFareConfigsQuery,
  useDeleteFareConfigMutation,
} from "../../map/admin-slice/fareSlice";
import { useToast } from "../../components/ui/use-toast";
import FareConfigForm from "../../components/admin-view/FareConfigForm";

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
          Error loading fare estimation
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-1">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
            <div>
              <CardTitle>Fare Estimation</CardTitle>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Fare
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingConfig
                      ? "Edit Fare Estimation"
                      : "Create New Fare Estimation"}
                  </DialogTitle>
                </DialogHeader>
                <FareConfigForm
                  fareConfig={editingConfig}
                  onSuccess={handleDialogClose}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {fareConfigs?.data?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No fare Estimation found.</p>
              <p className="text-sm text-gray-400">
                Create your first fare estimation to get started.
              </p>
            </div>
          ) : (
            <Table className="bg-white rounded-lg shadow-sm p-2 mb-2 border font-normal ">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">
                    Distance Range (km)
                  </TableHead>
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
                    <TableCell>
                      {config.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white hover:text-white"
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="w-4 h-4" /> <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
                          size="sm"
                          onClick={() => handleDelete(config._id)}
                        >
                          <Trash2 className="w-4 h-4" /> <span>Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FareConfigPage;
