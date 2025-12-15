import React from "react";

const STEPS = [
  "CREATED",
  "CONFIRMED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function OrderStatusStepper({ status }) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center justify-between mb-6">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex items-center w-full">
            {/* Circle */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-orange-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
            >
              {isCompleted ? "✓" : index + 1}
            </div>

            {/* Label */}
            <div className="ml-2 text-xs font-semibold">
              {step.replaceAll("_", " ")}
            </div>

            {/* Line */}
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2
                  ${
                    index < currentIndex
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
