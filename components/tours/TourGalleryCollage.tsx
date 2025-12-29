"use client";

import Image from "next/image";
import GalleryLightbox from "@/components/shared/GalleryLightbox";

type TourGalleryCollageProps = {
  images: string[];
  title: string;
  fallbackImage: string;
};

export default function TourGalleryCollage({ images, title, fallbackImage }: TourGalleryCollageProps) {
  const collageImages = images.slice(0, 4);
  const primaryCollageImage = collageImages[0] ?? fallbackImage;
  const secondaryCollageImages = collageImages.slice(1, 4);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-[36px] bg-slate-100 p-3 lg:h-full">
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
            <div className="relative overflow-hidden rounded-[28px] bg-slate-200">
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
                <div key={image ?? index} className="relative overflow-hidden rounded-[24px] bg-slate-200">
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
              View gallery
            </div>
          </div>
        )}
      />
    </div>
  );
}
