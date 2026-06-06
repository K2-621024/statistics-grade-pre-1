"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Props = { onClose: () => void };

type NormalData = Record<string, Record<string, number>>;
type TData = Record<string, Record<string, number>>;

export default function StatTableModal({ onClose }: Props) {
  const [tab, setTab] = useState<"normal" | "t">("normal");
  const [normalData, setNormalData] = useState<NormalData | null>(null);
  const [tData, setTData] = useState<TData | null>(null);

  useEffect(() => {
    fetch("/data/stat_tables/normal.json")
      .then((r) => r.json())
      .then((d) => setNormalData(d.data))
      .catch(() => {});
    fetch("/data/stat_tables/t.json")
      .then((r) => r.json())
      .then((d) => setTData(d.data))
      .catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex gap-2">
            {(["normal", "t"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${
                  tab === t
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t === "normal" ? "正規分布表" : "t分布表"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* テーブル */}
        <div className="overflow-auto flex-1 p-3">
          {tab === "normal" && normalData ? (
            <NormalTable data={normalData} />
          ) : tab === "t" && tData ? (
            <TTable data={tData} />
          ) : (
            <p className="text-center text-gray-400 py-8">読込中…</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NormalTable({ data }: { data: NormalData }) {
  const rows = Object.keys(data).sort();
  const cols = ["0","1","2","3","4","5","6","7","8","9"];
  return (
    <table className="text-xs w-full border-collapse">
      <thead>
        <tr className="bg-blue-50">
          <th className="border border-gray-200 px-2 py-1 text-left">z</th>
          {cols.map((c) => <th key={c} className="border border-gray-200 px-1 py-1">.0{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r} className="hover:bg-gray-50">
            <td className="border border-gray-200 px-2 py-1 font-medium">{r}</td>
            {cols.map((c) => (
              <td key={c} className="border border-gray-200 px-1 py-1 text-center">
                {data[r]?.[c]?.toFixed(4) ?? ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TTable({ data }: { data: TData }) {
  const rows = Object.keys(data);
  const alphas = ["0.10","0.05","0.02","0.01"];
  return (
    <table className="text-xs w-full border-collapse">
      <thead>
        <tr className="bg-blue-50">
          <th className="border border-gray-200 px-2 py-1 text-left">自由度</th>
          {alphas.map((a) => (
            <th key={a} className="border border-gray-200 px-2 py-1">α={a}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((df) => (
          <tr key={df} className="hover:bg-gray-50">
            <td className="border border-gray-200 px-2 py-1 font-medium">{df}</td>
            {alphas.map((a) => (
              <td key={a} className="border border-gray-200 px-2 py-1 text-center">
                {data[df]?.[a]?.toFixed(3) ?? ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
