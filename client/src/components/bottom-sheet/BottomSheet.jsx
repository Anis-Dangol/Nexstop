import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const MINIMIZED_Y = "70%"; // 70% down, adjust as needed

const BottomSheet = ({ isOpen, onClose, children }) => {
  const controls = useAnimation();
  const sheetRef = useRef(null);
  const [minimized, setMinimized] = useState(false);

  // Handle drag end: minimize if dragged down, expand if dragged up while minimized
  const handleDragEnd = (event, info) => {
    if (!minimized && info.offset.y > 80) {
      setMinimized(true);
      controls.start({ y: MINIMIZED_Y });
    } else if (minimized && info.offset.y < -60) {
      setMinimized(false);
      controls.start({ y: 0 });
    } else {
      controls.start({ y: minimized ? MINIMIZED_Y : 0 });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMinimized(false);
      controls.start({ y: 0 });
    } else {
      controls.start({ y: "100%" });
    }
  }, [isOpen, controls]);

  return (
    <motion.div
      ref={sheetRef}
      initial={{ y: "100%" }}
      animate={controls}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.2}
      style={{
        height: "50vh", // Set to half screen height
        touchAction: "none",
      }}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl z-50"
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle and Expand/Close Buttons */}
      <div className="flex justify-between items-center py-2 px-4 pb-0 cursor-grab active:cursor-grabbing">
        <div className="flex-1 flex justify-center">
          {/* Drag handle triggers minimize/expand by drag */}
          <div className="w-12 h-1.5 bg-gray-400 rounded-full"></div>
        </div>
        {/* Close button removed */}
      </div>
      {/* Content (hidden when minimized) */}
      {!minimized && (
        <div className="p-4 h-full flex flex-col">
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      )}
    </motion.div>
  );
};

export default BottomSheet;
