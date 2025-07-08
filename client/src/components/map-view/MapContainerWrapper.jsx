import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import UserLocationMarker from "../route-marker/UserLocationMarker";
import BusStopMarkers from "../route-marker/BusStopMarkers";
import RouteMarkers from "../route-marker/RouteMarkers";
import ZoomLevelTracker from "./ZoomLevelTracker";
import BottomSheet from "../bottom-sheet/BottomSheet";
import MapBottomSheet from "../bottom-sheet/MapBottomSheet";
import RoutePopup from "./RoutePopup";
import TransferInfoButton from "../transfer/TransferInfoButton";
import TransferPopup from "../transfer/TransferPopup";
import { useMapData } from "../../hooks/useMapData";
import { useBottomSheet } from "../../hooks/useBottomSheet";

export default function MapContainerWrapper({
  route: routeProp,
  triggerOpenBottomSheet,
}) {
  const [zoom, setZoom] = useState(13);

  // Custom hooks for data and UI state management
  const {
    
    fareData,
    allStops,
    predefinedRoutes,
    apiRouteCoords,
    userToStartCoords,
    transferMessage,
    route,
    nearestStopMarker,
    center,
    refreshFareData,
  } = useMapData(routeProp);

  const {
    isBottomSheetOpen,
    activeTab,
    routePopupOpen,
    routePopupPos,
    showTransferPopup,
    setActiveTab,
    closeBottomSheet,
    openRoutePopup,
    closeTransferPopup,
    openTransferPopup,
  } = useBottomSheet(routeProp, triggerOpenBottomSheet);

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        className="h-screen w-full z-0"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomLevelTracker onZoomChange={setZoom} />
        <UserLocationMarker position={center} />

        {/* Bus Stop Markers */}
        <BusStopMarkers
          busStops={allStops}
          routesData={predefinedRoutes}
          show={zoom >= 14}
          onSetStart={(stopName) => {
            if (window.setStartInput) window.setStartInput(stopName);
          }}
          onSetEnd={(stopName) => {
            if (window.setEndInput) window.setEndInput(stopName);
          }}
        />

        {/* Nearest Stop Marker */}
        {nearestStopMarker && (
          <Marker
            position={[nearestStopMarker.lat, nearestStopMarker.lon]}
            zIndexOffset={1000}
            icon={L.divIcon({
              className: "nearest-stop-marker",
              iconSize: [30, 30],
              html: `<div class='nearest-stop-icon'>📍</div>`,
            })}
          >
            <Popup>
              <div>
                <strong>Nearest Bus Stop</strong>
                <br />
                {nearestStopMarker.name}
                <br />
                <small style={{ color: "#666" }}>
                  Auto-detected based on your location
                </small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {apiRouteCoords.length > 1 && (
          <>
            <Polyline
              positions={apiRouteCoords}
              color="blue"
              weight={6}
              eventHandlers={{
                click: (e) => openRoutePopup(e.latlng),
              }}
            />
            {routePopupOpen &&
              routeProp &&
              routeProp.length > 1 &&
              routePopupPos && (
                <RoutePopup
                  start={routeProp[0].name}
                  end={routeProp[routeProp.length - 1].name}
                  position={routePopupPos}
                  transferMessage={transferMessage}
                />
              )}
          </>
        )}

        {/* User to Start Route */}
        {userToStartCoords.length > 1 && (
          <Polyline
            positions={userToStartCoords}
            color="green"
            weight={4}
            dashArray="6,8"
          />
        )}

        {/* Route Markers */}
        <RouteMarkers
          routeProp={routeProp}
          predefinedRoutes={predefinedRoutes}
        />
      </MapContainer>

      {/* Transfer Info Button */}
      <TransferInfoButton
        route={route}
        transferMessage={transferMessage}
        onShowTransferPopup={openTransferPopup}
      />

      {/* Transfer Info Popup */}
      <TransferPopup
        showTransferPopup={showTransferPopup}
        transferMessage={transferMessage}
        route={route}
        center={center}
        onClose={closeTransferPopup}
      />

      {/* Bottom Sheet */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={closeBottomSheet}>
        <MapBottomSheet
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fareData={fareData}
          route={routeProp}
          onFareTabClick={refreshFareData}
        />
      </BottomSheet>
    </div>
  );
}