import Link from "next/link";
import { Locale, translate, type TranslationKey } from "@/lib/translations";

type DestinationTile = {
  regionKey: TranslationKey;
  destinationKey: TranslationKey;
  statusKey: TranslationKey;
  stateTagKey?: TranslationKey;
  action?: string;
  descriptionKey?: TranslationKey;
  noteKey?: TranslationKey;
  image: string;
  icons?: string[];
  isLead?: boolean;
};

const destinationTiles: DestinationTile[] = [
  {
    regionKey: "destinations.region.caribbean",
    destinationKey: "destinations.destination.dominicanRepublic",
    statusKey: "destinations.status.active",
    action: "/tours?country=dominican-republic",
    descriptionKey: "destinations.description.dominicanRepublic",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    icons: ["ƒoæ", "ƒo^‹÷Z"]
  },
  {
    regionKey: "destinations.region.caribbean",
    destinationKey: "destinations.destination.bahamas",
    statusKey: "destinations.status.comingSoon",
    stateTagKey: "destinations.tag.audit",
    descriptionKey: "destinations.description.bahamas",
    noteKey: "destinations.note.verifying",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    icons: ["ƒoæ", "ƒo?‹÷Z"],
    isLead: true
  },
  {
    regionKey: "destinations.region.northAmerica",
    destinationKey: "destinations.destination.usa",
    statusKey: "destinations.status.underReview",
    stateTagKey: "destinations.tag.underReview",
    descriptionKey: "destinations.description.usa",
    noteKey: "destinations.note.verifying",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    icons: ["ƒo?‹÷Z", "ƒoæ"],
    isLead: true
  },
  {
    regionKey: "destinations.region.northAmerica",
    destinationKey: "destinations.destination.mexico",
    statusKey: "destinations.status.comingSoon",
    stateTagKey: "destinations.tag.audit",
    descriptionKey: "destinations.description.mexico",
    noteKey: "destinations.note.verifying",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    icons: ["ƒoæ", "ƒo?‹÷Z"],
    isLead: true
  },
  {
    regionKey: "destinations.region.europe",
    destinationKey: "destinations.destination.europe",
    statusKey: "destinations.status.expansion",
    stateTagKey: "destinations.tag.manual",
    descriptionKey: "destinations.description.europe",
    noteKey: "destinations.note.verifying",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    icons: ["ƒo?‹÷Z", "ƒoæ"],
    isLead: true
  },
  {
    regionKey: "destinations.region.middleEast",
    destinationKey: "destinations.destination.mideast",
    statusKey: "destinations.status.onDemand",
    stateTagKey: "destinations.tag.byInvite",
    descriptionKey: "destinations.description.mideast",
    noteKey: "destinations.note.verifying",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=900&q=80",
    icons: ["ƒo?‹÷Z", "ƒoæ"],
    isLead: true
  }
];

type Props = {
  locale: Locale;
};

export default function PublicDestinationsPage({ locale }: Props) {
  return (
    <div className="bg-slate-50 pb-16">
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <section className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{translate(locale, "destinations.label")}</p>
          <h1 className="text-4xl font-semibold text-slate-900">{translate(locale, "destinations.heading")}</h1>
          <p className="text-sm text-slate-600">{translate(locale, "destinations.description")}</p>
        </section>

        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {destinationTiles.map((tile) => (
              <article
                key={tile.destinationKey}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1"
              >
                <div
                  className={`relative h-52 bg-cover bg-center ${tile.isLead ? "hover:grayscale hover:brightness-75" : ""}`}
                  style={{ backgroundImage: `url(${tile.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />
                  <p className="absolute left-4 top-4 rounded-full border border-white/70 bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    {translate(locale, tile.regionKey)}
                  </p>
                </div>
                <div className="space-y-3 px-6 py-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    {tile.icons?.map((icon) => (
                      <span key={icon} aria-label="icon">
                        {icon}
                      </span>
                    ))}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{translate(locale, tile.destinationKey)}</h2>
                    <p className="text-sm text-slate-600">
                      {tile.descriptionKey ? translate(locale, tile.descriptionKey) : translate(locale, "destinations.placeholder")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    <span>{translate(locale, tile.statusKey)}</span>
                    <span className="text-sky-500">
                      {tile.action ? translate(locale, "destinations.action.view") : tile.stateTagKey ? translate(locale, tile.stateTagKey) : ""}
                    </span>
                  </div>
                  {tile.noteKey && <p className="text-xs text-slate-500">{translate(locale, tile.noteKey)}</p>}
                  {tile.action ? (
                    <Link
                      href={tile.action}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
                    >
                      {translate(locale, "destinations.action.explore")}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
                    >
                      {translate(locale, "destinations.action.notify")}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <p>{translate(locale, "destinations.footer")}</p>
        </section>
      </main>
    </div>
  );
}
