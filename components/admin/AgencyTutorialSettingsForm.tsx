"use client";

import { updateAgencyTutorialContentAction } from "@/app/(dashboard)/admin/settings/actions";
import VehicleImageField from "@/components/admin/transfers/VehicleImageField";

type Props = {
  defaults: {
    screenshotPrimary: string;
    screenshotSecondary: string;
    screenshotTertiary: string;
  };
};

export default function AgencyTutorialSettingsForm({ defaults }: Props) {
  return (
    <form action={updateAgencyTutorialContentAction} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Landing tutorial de agencias</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">Capturas del flujo comercial</h3>
      <p className="text-sm text-slate-500">
        Sube solo las capturas o pega URLs. Estas imagenes alimentan la landing informativa
        <code className="ml-1 rounded bg-white px-1.5 py-0.5 text-xs">/agency-program</code>.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <VehicleImageField
          name="agency_tutorial_screenshot_primary"
          label="Captura principal"
          defaultValue={defaults.screenshotPrimary}
          supplierId="admin"
        />
        <VehicleImageField
          name="agency_tutorial_screenshot_secondary"
          label="Captura secundaria"
          defaultValue={defaults.screenshotSecondary}
          supplierId="admin"
        />
        <VehicleImageField
          name="agency_tutorial_screenshot_tertiary"
          label="Captura terciaria"
          defaultValue={defaults.screenshotTertiary}
          supplierId="admin"
        />
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
      >
        Guardar capturas del tutorial
      </button>
    </form>
  );
}
