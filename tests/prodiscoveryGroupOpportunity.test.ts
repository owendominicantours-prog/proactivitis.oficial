import {
  buildFallbackItineraryDraft,
  calculateGroupOpportunityAccounting,
  normalizeProDiscoveryGroupPayload
} from "@/lib/prodiscoveryGroupOpportunity";

describe("ProDiscovery group opportunities", () => {
  it("normalizes a valid planner request and prepares deposit math", () => {
    const result = normalizeProDiscoveryGroupPayload({
      locale: "es",
      city: "Paris",
      country: "France",
      groupType: "companies",
      groupSize: "12",
      budgetTier: "mid",
      interests: ["transport", "gastronomy"],
      dream: "Queremos transporte privado, guia local y una cena especial para cerrar el viaje.",
      contactName: "Owen",
      contactEmail: "owen@example.com"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.city).toBe("Paris");
    expect(result.data.groupSize).toBe(12);
    expect(result.data.estimatedBudget).toBe(2220);
    expect(result.data.depositAmount).toBe(444);
  });

  it("rejects incomplete planner requests", () => {
    const result = normalizeProDiscoveryGroupPayload({
      city: "",
      groupType: "companies",
      groupSize: "1",
      budgetTier: "mid",
      interests: [],
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
      city: "Rome",
      groupType: "families",
      groupSize: 8,
      budgetTier: "premium",
      interests: ["culture", "transport"],
      dream: "Necesitamos una experiencia privada con guia, transporte y horarios flexibles para adultos y ninos.",
      contactName: "Maria",
      contactEmail: "maria@example.com"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const draft = buildFallbackItineraryDraft(result.data, "PD-TEST");
    expect(draft.summary).toContain("PD-TEST");
    expect(draft.days.length).toBeGreaterThanOrEqual(2);
    expect(draft.supplierNeeds).toContain("Transporte privado dimensionado al grupo");
  });
});
