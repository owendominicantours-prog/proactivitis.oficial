type BookingPresentationInput = {
  flowType?: string | null;
  tripType?: string | null;
  originAirport?: string | null;
  flightNumber?: string | null;
  hotel?: string | null;
  pickup?: string | null;
  pickupNotes?: string | null;
  returnTravelDate?: string | Date | null;
  returnStartTime?: string | null;
  startTime?: string | null;
  travelDateValue?: string | Date | null;
  tourIncludes?: string | null;
  language?: string | null;
  duration?: string | null;
  meetingPoint?: string | null;
};

export type BookingServiceKind = "transfer" | "activity";

export function getBookingServiceKind(input: BookingPresentationInput): BookingServiceKind {
  if (input.flowType === "tour") return "activity";
  if (input.flowType === "transfer") return "transfer";
  if (input.originAirport || input.flightNumber) return "transfer";
  if (input.tripType === "round-trip" || input.tripType === "one-way") return "transfer";
  return "activity";
}

export function buildBookingPresentation(input: BookingPresentationInput) {
  const kind = getBookingServiceKind(input);
  const routeOrigin = input.originAirport ?? input.pickup ?? input.meetingPoint ?? input.hotel ?? "Pendiente";
  const routeDestination = input.hotel ?? input.pickup ?? input.meetingPoint ?? "Pendiente";

  if (kind === "transfer") {
    return {
      kind,
      serviceLabel: "Traslado",
      routeLabel: "Ruta del traslado",
      routeValue: `${routeOrigin} / ${routeDestination}`,
      notesLabel: "Detalles del servicio",
      notesValue:
        input.pickupNotes ??
        (input.tripType === "round-trip"
          ? "Traslado ida y vuelta con coordinación operativa."
          : "Traslado confirmado con coordinación operativa."),
      logisticsLabel: "Operación del traslado",
      logisticsValue: [
        input.tripType === "round-trip" ? "Ida y vuelta" : "Solo ida",
        input.flightNumber ? `Vuelo ${input.flightNumber}` : null
      ]
        .filter(Boolean)
        .join(" · "),
      primaryDetailsLabel: "Datos del traslado",
      primaryDetailsValue:
        input.pickupNotes ??
        "Recogida y salida sujetas a coordinación con el chofer."
    };
  }

  return {
    kind,
    serviceLabel: "Actividad",
    routeLabel: "Punto de encuentro",
    routeValue: input.meetingPoint ?? input.pickup ?? input.hotel ?? "Pendiente",
    notesLabel: "Servicios incluidos",
    notesValue:
      input.tourIncludes ??
      input.pickupNotes ??
      "Actividad confirmada con coordinación previa.",
    logisticsLabel: "Operación de la actividad",
    logisticsValue: [input.duration, input.language, input.startTime].filter(Boolean).join(" · "),
    primaryDetailsLabel: "Detalles de la actividad",
    primaryDetailsValue:
      input.tourIncludes ??
      input.pickupNotes ??
      "Actividad confirmada con coordinación previa."
  };
}
