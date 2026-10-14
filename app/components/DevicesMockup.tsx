import PhoneMockup from "@/app/components/PhoneMockup";
import TabletMockup from "@/app/components/TabletMockup";

export default function DevicesMockup() {
  return (
    <div className="relative mx-auto h-[270px] w-[333px] max-[359px]:h-[218px] max-[359px]:w-[269px] min-[480px]:max-[639px]:h-[338px] min-[480px]:max-[639px]:w-[416px] sm:h-[416px] sm:w-[512px] lg:mx-0 lg:ml-auto lg:h-[364px] lg:w-[448px] xl:h-[468px] xl:w-[576px]">
      <div className="absolute left-0 top-0 h-[520px] w-[640px] origin-top-left scale-[0.52] max-[359px]:scale-[0.42] min-[480px]:max-[639px]:scale-[0.65] sm:scale-[0.8] lg:scale-[0.7] xl:scale-90">
        <TabletMockup />
        <PhoneMockup />
      </div>
    </div>
  );
}
