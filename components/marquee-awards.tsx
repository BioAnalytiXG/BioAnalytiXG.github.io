import { Marquee } from "@/components/shadcn-space/animations/marquee";

type BrandList = {
  image: string;
  lightimg: string;
  name: string;
};

const brandList: BrandList[] = [
  {
    image: "/images/awards/ennovation-2024.png",
    lightimg: "/images/awards/ennovation-2024.png",
    name: "Ennovation 2024",
  },
  {
    image: "/images/awards/yerame.jpg",
    lightimg: "/images/awards/yerame.jpg",
    name: "YERAME 2024",
  },
  {
    image: "/images/awards/innohealth-2024.png",
    lightimg: "/images/awards/innohealth-2024.png",
    name: "InnoHealth 2024",
  },
  {
    image: "/images/awards/aws-activate.png",
    lightimg: "/images/awards/aws-activate.png",
    name: "AWS Activate for Startups",
  },
  {
    image: "/images/awards/forbes.jpg",
    lightimg: "/images/awards/forbes.jpg",
    name: "Forbes Recognition",
  },
];

export default function MarqueeAwards() {
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
