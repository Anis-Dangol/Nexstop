import { Popup } from "react-leaflet";

export default function TransferPopup({
  showTransferPopup,
  transferMessage,
  route,
  center,
  onClose,
}) {
  if (!showTransferPopup) return null;

  return (
    <Popup
      position={route[1] ? [route[1].lat, route[1].lon] : center}
      onClose={onClose}
    >
      <div>
        <strong>Transfer Info</strong>
        <div>{transferMessage}</div>
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Popup>
  );
}
