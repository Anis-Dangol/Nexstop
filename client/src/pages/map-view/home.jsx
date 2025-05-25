import MapView from "@/components/map-view/mapView";

function MappingHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-screen overflow-hidden">
        <MapView />
      </div>
    </div>
  );
}

export default MappingHome;
