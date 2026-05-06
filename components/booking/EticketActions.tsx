"use client";

import { useCallback, useState } from "react";

type EticketActionsProps = {
  bookingId: string;
  tourTitle: string;
  orderCode: string;
};

export default function EticketActions({ bookingId, tourTitle, orderCode }: EticketActionsProps) {
  const [shareLabel, setShareLabel] = useState("Compartir mi e-ticket");
  const [downloadLabel, setDownloadLabel] = useState("Descargar PDF");

  const handleDownload = useCallback(async () => {
    setDownloadLabel("Preparando...");
    try {
      const response = await fetch(`/api/bookings/${bookingId}/eticket`, {
        method: "GET",
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error("No se pudo generar el PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proactivitis-eticket-${orderCode.replace(/[^a-zA-Z0-9-]/g, "")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadLabel("Descargado");
      window.setTimeout(() => setDownloadLabel("Descargar PDF"), 1800);
    } catch {
      setDownloadLabel("Intentar otra vez");
    }
  }, [bookingId, orderCode]);

  const handleShare = useCallback(async () => {
    const ticketUrl = `${window.location.origin}/api/bookings/${bookingId}/eticket`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `E-Ticket ${orderCode}`,
          text: `Mi voucher de ${tourTitle}`,
          url: ticketUrl
        });
        setShareLabel("Compartido");
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(ticketUrl);
      setShareLabel("Enlace copiado");
    } catch {
      setShareLabel("Enlace listo para compartir");
    }

    setTimeout(() => setShareLabel("Compartir mi e-ticket"), 2000);
  }, [bookingId, orderCode, tourTitle]);

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700"
      >
        {downloadLabel}
      </button>
      <button
        onClick={handleShare}
        className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 transition hover:bg-emerald-50"
      >
        {shareLabel}
      </button>
    </div>
  );
}
