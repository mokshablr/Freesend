import { constructMetadata } from "@/lib/utils";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";


export const metadata = constructMetadata({
  title: "Inactive",
  description: "Your Grovv.app account is made inactive by admin.",
});

export default async function PricingPage() {
  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <MaxWidthWrapper>
        <HeaderSection
          label="Alert!"
          title="Account Inactive"
          subtitle="Your account is made inactive by administrator."
        />
      </MaxWidthWrapper>
    </div>
  );
}
