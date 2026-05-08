import { expandWorkplacePermissions } from "@/lib/workplaceAccess";

describe("expandWorkplacePermissions", () => {
  it("lets tour editors view tours", () => {
    const permissions = expandWorkplacePermissions(["tours.edit"]);

    expect(permissions.has("tours.edit")).toBe(true);
    expect(permissions.has("tours.view")).toBe(true);
  });

  it("lets tour media users view tours", () => {
    const permissions = expandWorkplacePermissions(["tours.media"]);

    expect(permissions.has("tours.media")).toBe(true);
    expect(permissions.has("tours.view")).toBe(true);
  });

  it("expands wildcard access to real workplace permissions", () => {
    const permissions = expandWorkplacePermissions(["*"]);

    expect(permissions.has("tours.edit")).toBe(true);
    expect(permissions.has("workplace.manage")).toBe(true);
  });
});
