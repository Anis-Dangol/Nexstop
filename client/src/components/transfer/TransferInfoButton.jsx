export default function TransferInfoButton({
  route,
  transferMessage,
  onShowTransferPopup,
}) {
  if (!route || route.length <= 1 || !transferMessage) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-4 z-50">
      <button
        className="bg-yellow-200 text-black px-6 py-3 rounded shadow-lg font-semibold border border-yellow-400 hover:bg-yellow-300 transition"
        onClick={onShowTransferPopup}
      >
        {transferMessage}
      </button>
    </div>
  );
}
