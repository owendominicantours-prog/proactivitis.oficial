"use client";

import Image from "next/image";
import GalleryLightbox from "@/components/shared/GalleryLightbox";

type TourGalleryCollageProps = {
  images: string[];
  title: string;
  fallbackImage: string;
  label?: string;
  variant?: "default" | "compact";
};

export default function TourGalleryCollage({
  images,
  title,
  fallbackImage,
  label = "View gallery",
  variant = "default"
}: TourGalleryCollageProps) {
  const collageImages = images.slice(0, 4);
  const primaryCollageImage = collageImages[0] ?? fallbackImage;
  const secondaryCollageImages = collageImages.slice(1, 4);
  const shellClassName =
    variant === "compact"
      ? "relative h-[300px] w-full overflow-hidden rounded-[28px] bg-slate-100 p-2.5 sm:h-[350px] lg:h-[430px]"
      : "relative h-[380px] w-full overflow-hidden rounded-[36px] bg-slate-100 p-3 sm:h-[420px] lg:h-[520px]";
  const primaryRadius = variant === "compact" ? "rounded-[22px]" : "rounded-[28px]";
  const secondaryRadius = variant === "compact" ? "rounded-[20px]" : "rounded-[24px]";

  return (
    <div className={shellClassName}>
      <GalleryLightbox
        images={images}
        showDefaultTrigger={false}
        renderTrigger={(open) => (
          <div
            role="button"
            tabIndex={0}
            onClick={() => open()}
            className="relative grid h-full w-full cursor-pointer grid-cols-2 gap-2"
          >
            <div className={`relative overflow-hidden bg-slate-200 ${primaryRadius}`}>
              <Image
                src={primaryCollageImage}
                alt={title}
                fill
                className="object-cover transition duration-500 hover:scale-105"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            </div>
            <div className="grid w-full grid-rows-2 gap-2">
              {secondaryCollageImages.map((image, index) => (
                <div key={image ?? index} className={`relative overflow-hidden bg-slate-200 ${secondaryRadius}`}>
                  <Image
                    src={image ?? primaryCollageImage}
                    alt={`${title} imagen ${index + 2}`}
                    fill
                    className="object-cover transition duration-500 hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/60 bg-black/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white backdrop-blur">
              {label}
            </div>
          </div>
        )}
      />
    </div>
  );
}
