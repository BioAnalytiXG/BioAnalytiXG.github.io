import { Marquee } from "@/components/shadcn-space/animations/marquee";

type BrandList = {
  image: string;
  lightimg: string;
  name: string;
};

const brandList: BrandList[] = [
  {
    image: "/images/partners/general-hospital-larissa.jpg",
    lightimg: "/images/partners/general-hospital-larissa.jpg",
    name: "General Hospital of Larissa",
  },
  {
    image: "/images/partners/acta-lab.png",
    lightimg: "/images/partners/acta-lab.png",
    name: "ACTA Lab",
  },
  {
    image: "/images/universities/anatomy_lab_logo_EN.png",
    lightimg: "/images/universities/anatomy_lab_logo_EN.png",
    name: "Anatomy Lab, University of Thessaly",
  },
];

export default function MarqueePartners() {
  return (
    <>
      <Marquee className="[--duration:20s] p-0">
        {brandList.map((brand, index) => (
          <div key={index}>
            <img
              src={brand.image}
              alt={brand.name}
              className="w-auto h-20 mr-6 lg:mr-20 dark:hidden"
            />
            <img
              src={brand.lightimg}
              alt={brand.name}
              className="hidden dark:block w-auto h-20 mr-12 lg:mr-20"
            />
          </div>
        ))}
      </Marquee>
    </>
  );
}
