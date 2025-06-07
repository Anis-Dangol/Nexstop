import React, { useRef } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";

const BottomSheet = ({ isOpen, onClose, children }) => {
  const y = useMotionValue(0);
  const controls = useAnimation();
  const sheetRef = useRef(null);

  // Handle drag end: if dragged down enough, close
  const handleDragEnd = (event, info) => {
    if (info.offset.y > 80) {
      controls.start({ y: "100%" });
      setTimeout(onClose, 200); // Give time for animation
    } else {
      controls.start({ y: 0 });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
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
      style={{ minHeight: "150px", touchAction: "none" }}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl z-50"
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle */}
      <div className="flex justify-center py-2 cursor-grab active:cursor-grabbing">
        <div className="w-12 h-1.5 bg-gray-400 rounded-full"></div>
      </div>
      {/* Content */}
      <div className="p-4">{children}</div>
    </motion.div>
  );
};

export default BottomSheet;
  