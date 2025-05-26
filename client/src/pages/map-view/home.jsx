import MapContainerWrapper from "@/components/map-view/MapContainerWrapper";

function MappingHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-screen overflow-hidden">
        <MapContainerWrapper />
      </div>
    </div>
  );
}

export default MappingHome;
