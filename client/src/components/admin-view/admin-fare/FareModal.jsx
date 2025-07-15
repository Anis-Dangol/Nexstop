import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import FareConfigForm from "./FareConfigForm";

const FareModal = ({ isOpen, onClose, editingConfig, onSuccess }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingConfig
              ? "Edit Fare Estimation"
              : "Create New Fare Estimation"}
          </DialogTitle>
        </DialogHeader>
        <FareConfigForm fareConfig={editingConfig} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default FareModal;
