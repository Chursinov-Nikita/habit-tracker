"use client";

import { useState } from "react";
import Image from "next/image";

export default function HeroImage() {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <Image
      src="/hero-bg.jpg"
      alt=""
      fill
      priority
      sizes="100vw"
      quality={75}
      onError={() => setFailed(true)}
      className="-z-20 object-cover object-[65%_center]"
    />
  );
}
