"use client";

import { useCallback, useState } from "react";

type EticketActionsProps = {
  bookingId: string;
  tourTitle: string;
  orderCode: string;
};

export default function EticketActions({ bookingId, tourTitle, orderCode }: EticketActionsProps) {
  const [shareLabel, setShareLabel] = useState("Compartir mi e-ticket");

  const handleDownload = useCallback(() => {
    const url = `/api/bookings/${bookingId}/eticket`;
    window.open(url, "_blank");
  }, [bookingId]);

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
        Descargar PDF
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
