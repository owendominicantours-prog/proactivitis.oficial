import {
  buildFallbackItineraryDraft,
  calculateGroupOpportunityAccounting,
  normalizeProDiscoveryGroupPayload
} from "@/lib/prodiscoveryGroupOpportunity";

describe("ProDiscovery group opportunities", () => {
  it("normalizes a valid planner request and prepares deposit math", () => {
    const result = normalizeProDiscoveryGroupPayload({
      locale: "es",
      city: "Santo Domingo",
      country: "Republica Dominicana",
      groupType: "companies",
      groupSize: "12",
      budgetTier: "mid",
      languages: ["es", "en"],
      assistance: ["transport", "group-logistics"],
      holidayStyles: ["local", "gastronomy"],
      additionalServices: ["photographer"],
      dream: "Queremos transporte privado, guia local y una cena especial para cerrar el viaje.",
      contactName: "Owen",
      contactEmail: "owen@example.com"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.city).toBe("Santo Domingo");
    expect(result.data.groupSize).toBe(12);
    expect(result.data.estimatedBudget).toBe(2220);
    expect(result.data.depositAmount).toBe(444);
    expect(result.data.languages).toEqual(["es", "en"]);
  });

  it("rejects incomplete planner requests", () => {
    const result = normalizeProDiscoveryGroupPayload({
      city: "",
      groupType: "companies",
      groupSize: "1",
      budgetTier: "mid",
      languages: [],
      assistance: [],
      holidayStyles: [],
      dream: "corto",
      contactName: "",
      contactEmail: "bad-email"
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.length).toBeGreaterThan(3);
  });

  it("calculates commission from accepted budget", () => {
    const accounting = calculateGroupOpportunityAccounting({
      groupSize: 20,
      budgetTier: "premium",
      acceptedBudget: 10000,
      depositPercent: 20,
      leaderCommissionPercent: 12
    });

    expect(accounting.depositAmount).toBe(2000);
    expect(accounting.leaderCommissionAmount).toBe(1200);
  });

  it("builds a fallback itinerary when AI is unavailable", () => {
    const result = normalizeProDiscoveryGroupPayload({
      city: "Santo Domingo",
      groupType: "families",
      groupSize: 8,
      budgetTier: "premium",
      languages: ["es"],
      assistance: ["transport", "group-logistics"],
      holidayStyles: ["local", "relax"],
      dream: "Necesitamos una experiencia privada con guia, transporte y horarios flexibles para adultos y ninos.",
      contactName: "Maria",
      contactEmail: "maria@example.com"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const draft = buildFallbackItineraryDraft(result.data, "PD-TEST");
    expect(draft.summary).toContain("PD-TEST");
    expect(draft.days.length).toBeGreaterThanOrEqual(2);
    expect(draft.supplierNeeds).toContain("Transporte privado ajustado al tamano del grupo");
  });

  it("marks wedding language as VIP priority", () => {
    const result = normalizeProDiscoveryGroupPayload({
      city: "Punta Cana",
      groupType: "weddings",
      groupSize: 24,
      budgetTier: "premium",
      languages: ["es", "en"],
      assistance: ["transport", "group-logistics"],
      holidayStyles: ["relax"],
      additionalServices: ["photographer"],
      dream: "Es la boda de mi hermana y queremos una experiencia privada con fotografo y cena especial.",
      contactName: "Laura",
      contactEmail: "laura@example.com"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.leadPriority).toBe("PRIORIDAD_VIP");
  });
});
