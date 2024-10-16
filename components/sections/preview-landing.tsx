import Image from "next/image";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function PreviewLanding() {
  return (
    <div className="pb-0 sm:pb-2">
    <div className="container max-w-7xl">
      <div className="rounded-xl md:bg-muted/10 md:p-3.5 md:ring-1 md:ring-inset md:ring-border">
        <div className="">
          <Image
            className="object-cover object-center"
            src="/images/home-scrshot.jpg"
            alt="preview"
            width={1200}
            height={504}
            priority={true}
          />
        </div>
      </div>
    </div>
  </div>
  );
}
