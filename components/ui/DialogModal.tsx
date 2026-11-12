"use client";

import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "confirm" | "danger" | "info";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  loading?: boolean;
}

export function DialogModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  onConfirm,
  loading = false,
}: DialogModalProps) {
  if (!isOpen) return null;

  const isQuestion = type === "confirm" || type === "danger";

  const icons = {
    success: <CheckCircle2 className="text-green-600" size={32} />,
    confirm: <AlertTriangle className="text-amber-500" size={32} />,
    danger: <AlertCircle className="text-red-600" size={32} />,
    info: <Info className="text-blue-600" size={32} />,
  };

  const bgColors = {
    success: "bg-green-50",
    confirm: "bg-amber-50",
    danger: "bg-red-50",
    info: "bg-blue-50",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${bgColors[type]}`}>
            {icons[type]}
          </div>

          <h3 className="text-base font-semibold text-[#0F172A] mb-1.5">{title}</h3>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-line">{message}</p>

          <div className="flex items-center justify-center gap-3 w-full">
            {isQuestion && (
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                {cancelText}
              </Button>
            )}

            <Button
              variant={type === "danger" ? "danger" : "primary"}
              className={isQuestion ? "flex-1" : "w-full max-w-xs"}
              loading={loading}
              onClick={() => {
                if (onConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}
            >
              {isQuestion ? confirmText : "Mengerti"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

