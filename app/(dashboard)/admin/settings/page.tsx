import { prisma } from "@/lib/prisma";
import { formatRecipientsForDisplay, notificationEmailDefaults } from "@/lib/notificationEmailSettings";
import { updateNotificationEmailSettingAction } from "./actions";

export default async function AdminSettingsPage() {
  const landingCount = await prisma.landingPage.count();
  const tourCount = await prisma.tour.count();
  const userCount = await prisma.user.count();
  const notificationKeys = notificationEmailDefaults.map((entry) => entry.key);
  const notificationSettings = await prisma.notificationEmailSetting.findMany({
    where: { key: { in: notificationKeys } }
  });
  const settingsMap = new Map(notificationSettings.map((setting) => [setting.key, setting]));

  return (
    <section className="space-y-8 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ajustes</h1>
        <p className="text-sm text-slate-500">
          Configuraci??n global: branding, integraciones y reglas de disponibilidad.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Landings activas</p>
          <p className="text-2xl font-semibold text-slate-900">{landingCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tours registrados</p>
          <p className="text-2xl font-semibold text-slate-900">{tourCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Usuarios totales</p>
          <p className="text-2xl font-semibold text-slate-900">{userCount}</p>
        </article>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Notificaciones por correo</h2>
          <p className="text-sm text-slate-500">
            Edita los correos destino para cada alerta. Separa varios emails con comas o saltos de l??nea.
          </p>
        </div>
        <div className="grid gap-4">
          {notificationEmailDefaults.map((setting) => {
            const saved = settingsMap.get(setting.key);
            const currentValue = formatRecipientsForDisplay(saved?.recipients ?? setting.defaultRecipients);
            return (
              <form
                key={setting.key}
                action={updateNotificationEmailSettingAction}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <input type="hidden" name="key" value={setting.key} />
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">{setting.label}</h3>
                    <p className="text-sm text-slate-500">{setting.description}</p>
                  </div>
                  <div className="w-full md:max-w-md">
                    <textarea
                      name="recipients"
                      defaultValue={currentValue}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      placeholder="correo@empresa.com"
                    />
                    <button
                      type="submit"
                      className="mt-3 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              </form>
            );
          })}
        </div>
      </div>
    </section>
  );
}
