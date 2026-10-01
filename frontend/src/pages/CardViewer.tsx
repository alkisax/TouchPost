// frontend/src/pages/CardViewer.tsx

import { useEffect } from "react";
import ImageListFrame from "../components/images/ImageListFrame";

type CardData = {
  password: string;
  theme: number;
  images: string[];
};

type ThemeConfig = {
  name: string;
  className: string;
};

const themes: Record<number, ThemeConfig> = {
  1: {
    name: "Classic",
    className: "theme-classic",
  },
  2: {
    name: "Polaroid",
    className: "theme-polaroid",
  },
  3: {
    name: "Dark",
    className: "theme-dark",
  },
};

const CardViewer = () => {
  const params = new URLSearchParams(window.location.search);

  const base = params.get("b") ?? "";

  const cardData: CardData = {
    password: params.get("p") ?? "",
    theme: Number(params.get("t") ?? 0),
    images: [
      params.get("i1"),
      params.get("i2"),
      params.get("i3"),
      params.get("i4"),
      params.get("i5"),
    ]
      .filter((path): path is string => Boolean(path))
      .map((path) => `${base}${path}`),
  };

  const selectedTheme = themes[cardData.theme] ?? themes[1];

  useEffect(() => {
    // Τα 3 arguments είναι: replaceState(state, unused, url)
    // εδω {}. "" και window.location.pathname κρατά μόνο το path.
    // window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <main className={selectedTheme.className}>
      <h1>TouchPost</h1>

      <p>Theme: {cardData.theme}</p>
      <p>Password: {cardData.password}</p>

      <div className="flex flex-col items-center gap-8">
        {cardData.images.map((imageUrl, index) => (
          <ImageListFrame
            key={`${imageUrl}-${index}`}
            src={imageUrl}
            alt={`TouchPost ${index + 1}`}
          />
        ))}
      </div>
    </main>
  );
}

export default CardViewer;