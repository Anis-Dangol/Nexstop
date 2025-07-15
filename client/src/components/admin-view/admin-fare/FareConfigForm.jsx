import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  useCreateFareConfigMutation,
  useUpdateFareConfigMutation,
} from "../../../map/admin-slice/fareSlice";
import { useToast } from "../../ui/use-toast";

const FareConfigForm = ({ fareConfig, onSuccess }) => {
  const [formData, setFormData] = useState({
    distanceRange: {
      min: fareConfig?.distanceRange?.min || 0,
      max: fareConfig?.distanceRange?.max || 1,
    },
    fare: fareConfig?.fare || 10,
    description: fareConfig?.description || "",
  });

  const [createFareConfig, { isLoading: isCreating }] =
    useCreateFareConfigMutation();
  const [updateFareConfig, { isLoading: isUpdating }] =
    useUpdateFareConfigMutation();
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parseFloat(value) || 0,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: field === "fare" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (fareConfig) {
        await updateFareConfig({ id: fareConfig._id, ...formData }).unwrap();
        toast({
          title: "Success",
          description: "Fare Estimation updated successfully",
        });
      } else {
        await createFareConfig(formData).unwrap();
        toast({
          title: "Success",
          description: "Fare Estimation created successfully",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minDistance">Min Distance (km)</Label>
          <Input
            id="minDistance"
            type="number"
            step="0.1"
            value={formData.distanceRange.min}
            onChange={(e) =>
              handleInputChange("distanceRange.min", e.target.value)
            }
            onWheel={(e) => e.target.blur()}
            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            required
          />
        </div>
        <div>
          <Label htmlFor="maxDistance">Max Distance (km)</Label>
          <Input
            id="maxDistance"
            type="number"
            step="0.1"
            value={formData.distanceRange.max}
            onChange={(e) =>
              handleInputChange("distanceRange.max", e.target.value)
            }
            onWheel={(e) => e.target.blur()}
            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="fare">Fare Amount (Rs. )</Label>
        <Input
          id="fare"
          type="number"
          step="0.01"
          value={formData.fare}
          onChange={(e) => handleInputChange("fare", e.target.value)}
          onWheel={(e) => e.target.blur()}
          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="e.g., Short distance fare"
        />
      </div>

      <Button type="submit" disabled={isCreating || isUpdating}>
        {isCreating || isUpdating
          ? "Saving..."
          : fareConfig
          ? "Update"
          : "Create"}
      </Button>
    </form>
  );
};

export default FareConfigForm;
