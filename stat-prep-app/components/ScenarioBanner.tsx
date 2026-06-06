"use client";
import MathText from "./MathText";

type Props = {
  distributionName: string;
  scenario: string;
  current: number;
  total: number;
  maskName?: boolean;
};

export default function ScenarioBanner({
  distributionName,
  scenario,
  current,
  total,
  maskName = false,
}: Props) {
  return (
    <div className="bg-blue-600 text-white rounded-xl p-4 mb-4 shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-0.5">
          {maskName ? "???" : distributionName}
        </span>
        <span className="text-xs font-bold">
          Q{current} / {total}
        </span>
      </div>
      <p className="text-sm leading-relaxed">
        <MathText text={scenario} />
      </p>
    </div>
  );
}
