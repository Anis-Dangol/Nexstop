import { useState, useEffect } from "react";

export const useBottomSheet = (routeProp, triggerOpenBottomSheet) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fare");
  const [routePopupOpen, setRoutePopupOpen] = useState(false);
  const [routePopupPos, setRoutePopupPos] = useState(null);
  const [showTransferPopup, setShowTransferPopup] = useState(false);

  // Effect: Open BottomSheet when triggered externally
  useEffect(() => {
    if (triggerOpenBottomSheet) {
      openBottomSheet("fare");
    }
  }, [triggerOpenBottomSheet]);

  // Effect: Open/close BottomSheet when route changes
  useEffect(() => {
    if (routeProp && routeProp.length > 1) {
      openBottomSheet("fare");
    } else {
      setIsBottomSheetOpen(false);
    }
  }, [routeProp]);

  const openBottomSheet = (tab = "fare") => {
    setIsBottomSheetOpen(true);
    setActiveTab(tab);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };

  const openRoutePopup = (latlng) => {
    setRoutePopupOpen(true);
    setRoutePopupPos(latlng);
  };

  const closeRoutePopup = () => {
    setRoutePopupOpen(false);
    setRoutePopupPos(null);
  };

  const openTransferPopup = () => {
    setShowTransferPopup(true);
  };

  const closeTransferPopup = () => {
    setShowTransferPopup(false);
  };

  return {
    isBottomSheetOpen,
    activeTab,
    routePopupOpen,
    routePopupPos,
    showTransferPopup,
    setActiveTab,
    openBottomSheet,
    closeBottomSheet,
    openRoutePopup,
    closeRoutePopup,
    openTransferPopup,
    closeTransferPopup,
  };
};
