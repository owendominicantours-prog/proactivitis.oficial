export const workplaceModules = [
  { key: "tours", label: "Tours" },
  { key: "rent_car", label: "Rent Car" },
  { key: "hotels", label: "Hoteles" },
  { key: "transfers", label: "Transfer" },
  { key: "suppliers", label: "Suplidores" },
  { key: "agencies", label: "Agencias" },
  { key: "bookings", label: "Reservas" },
  { key: "prodiscovery", label: "ProDiscovery" },
  { key: "finance", label: "Finanzas" },
  { key: "refunds", label: "Reembolsos" },
  { key: "chat", label: "Chat" },
  { key: "reports", label: "Reportes" },
  { key: "security", label: "Seguridad" }
] as const;

export const workplacePermissions = [
  { key: "tours.view", module: "tours", label: "Ver tours" },
  { key: "tours.edit", module: "tours", label: "Editar tours" },
  { key: "tours.media", module: "tours", label: "Subir o borrar fotos" },
  { key: "tours.price", module: "tours", label: "Modificar precios criticos", sensitive: true },
  { key: "tours.delete", module: "tours", label: "Eliminar tour", sensitive: true },
  { key: "rent_car.view", module: "rent_car", label: "Ver rent car" },
  { key: "rent_car.edit", module: "rent_car", label: "Editar vehiculos" },
  { key: "rent_car.price", module: "rent_car", label: "Cambiar precios rent car", sensitive: true },
  { key: "hotels.view", module: "hotels", label: "Ver hoteles" },
  { key: "hotels.edit", module: "hotels", label: "Editar hoteles" },
  { key: "transfers.view", module: "transfers", label: "Ver traslados" },
  { key: "transfers.edit", module: "transfers", label: "Editar rutas y tarifas" },
  { key: "bookings.view", module: "bookings", label: "Ver reservas" },
  { key: "bookings.edit", module: "bookings", label: "Editar reservas" },
  { key: "bookings.delete", module: "bookings", label: "Eliminar reservas", sensitive: true },
  { key: "prodiscovery.view", module: "prodiscovery", label: "Ver oportunidades ProDiscovery" },
  { key: "prodiscovery.manage", module: "prodiscovery", label: "Trabajar propuestas ProDiscovery" },
  { key: "prodiscovery.finance", module: "prodiscovery", label: "Gestionar depositos ProDiscovery", sensitive: true },
  { key: "suppliers.view", module: "suppliers", label: "Ver suplidores" },
  { key: "suppliers.support", module: "suppliers", label: "Soporte a suplidores" },
  { key: "suppliers.disable", module: "suppliers", label: "Desactivar suplidor", sensitive: true },
  { key: "agencies.view", module: "agencies", label: "Ver agencias" },
  { key: "agencies.support", module: "agencies", label: "Soporte a agencias" },
  { key: "finance.view", module: "finance", label: "Ver finanzas" },
  { key: "finance.commission", module: "finance", label: "Cambiar comisiones", sensitive: true },
  { key: "refunds.manage", module: "refunds", label: "Gestionar reembolsos", sensitive: true },
  { key: "chat.view", module: "chat", label: "Ver chat interno" },
  { key: "chat.respond", module: "chat", label: "Responder chat" },
  { key: "chat.manage", module: "chat", label: "Administrar salas de chat", sensitive: true },
  { key: "reports.view", module: "reports", label: "Ver reportes" },
  { key: "security.audit", module: "security", label: "Ver auditoria" },
  { key: "security.approve", module: "security", label: "Aprobar acciones sensibles", sensitive: true },
  { key: "workplace.manage", module: "security", label: "Administrar Workplace", sensitive: true }
] as const;

export const sensitiveWorkplaceActions = workplacePermissions.filter(
  (permission) => "sensitive" in permission && permission.sensitive
);

const impliedWorkplacePermissions: Record<string, string[]> = {
  "tours.edit": ["tours.view"],
  "tours.media": ["tours.view"],
  "tours.price": ["tours.view", "tours.edit"],
  "tours.delete": ["tours.view"],
  "rent_car.edit": ["rent_car.view"],
  "rent_car.price": ["rent_car.view", "rent_car.edit"],
  "hotels.edit": ["hotels.view"],
  "transfers.edit": ["transfers.view"],
  "bookings.edit": ["bookings.view"],
  "bookings.delete": ["bookings.view"],
  "prodiscovery.manage": ["prodiscovery.view"],
  "prodiscovery.finance": ["prodiscovery.view", "prodiscovery.manage", "finance.view"],
  "suppliers.support": ["suppliers.view"],
  "suppliers.disable": ["suppliers.view"],
  "agencies.support": ["agencies.view"],
  "finance.commission": ["finance.view"],
  "refunds.manage": ["finance.view"],
  "chat.respond": ["chat.view"],
  "chat.manage": ["chat.view"],
  "security.approve": ["security.audit"],
  "workplace.manage": ["security.audit"]
};

export function expandWorkplacePermissions(input: Iterable<string>) {
  const permissions = new Set(input);

  if (permissions.has("*")) {
    for (const permission of workplacePermissions) {
      permissions.add(permission.key);
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const [permission, implied] of Object.entries(impliedWorkplacePermissions)) {
      if (!permissions.has(permission)) continue;
      for (const impliedPermission of implied) {
        if (permissions.has(impliedPermission)) continue;
        permissions.add(impliedPermission);
        changed = true;
      }
    }
  }

  return permissions;
}
