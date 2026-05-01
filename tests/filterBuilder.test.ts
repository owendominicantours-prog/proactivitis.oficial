import { buildTourFilter } from "@/lib/filterBuilder";

describe("buildTourFilter", () => {
  it("includes country and destination slugs when provided", () => {
    const where = buildTourFilter({
      country: "dominican-republic",
      destination: "punta-cana"
    });

    expect(where.departureDestination?.is?.country?.slug).toEqual({
      in: ["dominican-republic", "dominican-republic-rd", "republica-dominicana"]
    });
    expect(where.departureDestination?.is?.slug).toBe("punta-cana");
  });

  it("treats Dominican Republic aliases as the same country", () => {
    const where = buildTourFilter({
      country: "republica-dominicana"
    });

    expect(where.OR).toEqual([
      { country: { slug: { in: ["dominican-republic", "dominican-republic-rd", "republica-dominicana"] } } },
      {
        departureDestination: {
          is: { country: { slug: { in: ["dominican-republic", "dominican-republic-rd", "republica-dominicana"] } } }
        }
      }
    ]);
  });

  it("adds price bounds when numeric values exist", () => {
    const where = buildTourFilter({
      minPrice: "50",
      maxPrice: "150"
    });

    expect(where.price?.gte).toBe(50);
    expect(where.price?.lte).toBe(150);
  });

  it("ignores invalid numbers", () => {
    const where = buildTourFilter({
      minPrice: "abc",
      maxPrice: "200"
    });

    expect(where.price?.gte).toBeUndefined();
    expect(where.price?.lte).toBe(200);
  });

  it("adds language and duration filters", () => {
    const where = buildTourFilter({
      language: "English",
      duration: "Full day"
    });

    expect(where.language).toEqual({ contains: "English", mode: "insensitive" });
    expect(where.duration).toBe("Full day");
  });
});
