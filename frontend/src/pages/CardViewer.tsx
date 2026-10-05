// frontend/src/pages/CardViewer.tsx

import { useEffect, useMemo, useState } from "react";
import { RowsPhotoAlbum, type Photo } from "react-photo-album";
import "react-photo-album/rows.css";
import CountryCodeBg from "../components/CountryCodeBg";

type CardData = {
  password: string;
  theme: number;
  countryCode?: string;
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
  const [photos, setPhotos] = useState<Photo[]>([]);

  const cardData = useMemo<CardData>(() => {
    const params = new URLSearchParams(window.location.search);

    const base = params.get("b") ?? "";

    return {
      password: params.get("p") ?? "",
      theme: Number(params.get("t") ?? 0),
      countryCode: params.get("c") || undefined,
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
  }, []);

  const selectedTheme = themes[cardData.theme] ?? themes[1];

  useEffect(() => {
    const loadPhotos = async () => {
      const loadedPhotos = await Promise.all(
        cardData.images.map(
          (src) =>
            new Promise<Photo>((resolve, reject) => {
              const image = new Image();

              image.onload = () => {
                resolve({
                  src,
                  width: image.naturalWidth,
                  height: image.naturalHeight,
                });
              };

              image.onerror = () => {
                reject(new Error(`Could not load image: ${src}`));
              };

              image.src = src;
            }),
        ),
      );

      setPhotos(loadedPhotos);
    };

    void loadPhotos();
  }, [cardData.images]);

  const handlePhotoClick = (photo: Photo) => {
    const params = new URLSearchParams();

    params.set("src", photo.src);

    if (cardData.countryCode) {
      params.set("c", cardData.countryCode);
    }

    window.location.href = `${import.meta.env.BASE_URL}photo?${params.toString()}`;
  };

  useEffect(() => {
    // Τα 3 arguments είναι: replaceState(state, unused, url)
    // εδω {}. "" και window.location.pathname κρατά μόνο το path.
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <>
      <CountryCodeBg countryCode={cardData.countryCode} />

      <main className={selectedTheme.className}>
        <h1>TouchPost</h1>

        <p>Theme: {cardData.theme}</p>
        <p>Password: {cardData.password}</p>

        {photos.length > 0 && (
          <div className="mx-auto w-[82%] max-w-md px-4 py-6">
            <RowsPhotoAlbum
              photos={photos}
              targetRowHeight={160}
              onClick={({ photo }) => handlePhotoClick(photo)}
              componentsProps={{
                image: {
                  draggable: false,
                  onContextMenu: (event) => event.preventDefault(),
                },
              }}
            />
          </div>
        )}
      </main>
    </>

  );
};

export default CardViewer;