// frontend/src/pages/Nfc213Viewer.tsx

import { useEffect, useMemo, useState } from "react";
import { RowsPhotoAlbum, type Photo } from "react-photo-album";
import "react-photo-album/rows.css";
import CountryCodeBg from "../components/CountryCodeBg";

type Nfc213Data = {
  countryCode?: string;
  cloudName: string;
  cardId: string;
};

const Nfc213Viewer = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [backImageUrl, setBackImageUrl] = useState("");

  /*
   * NFC213 compact payload:
   *
   * country | cloudName | cardId
   *
   * Παράδειγμα:
   * GR|be726cds|2
   *
   * Άρα το πλήρες NFC URL είναι:
   * https://alkisax.github.io/TouchPost/n#GR|be726cds|2
   */
  const cardData = useMemo<Nfc213Data>(() => {
    const hash = window.location.hash.replace("#", "");

    const [countryCode, cloudName = "", cardId = ""] = hash.split("|");

    return {
      countryCode: countryCode || undefined,
      cloudName,
      cardId,
    };
  }, []);

  /*
   * Ελέγχει αν μία πιθανή Cloudinary εικόνα υπάρχει.
   *
   * Αν φορτώσει επιτυχώς, επιστρέφουμε τα πραγματικά dimensions
   * ώστε να μπορεί το RowsPhotoAlbum να υπολογίσει σωστά το layout.
   *
   * Αν δεν υπάρχει, επιστρέφουμε null.
   */
  const loadPhoto = (src: string) => {
    return new Promise<Photo | null>((resolve) => {
      const image = new Image();

      image.onload = () => {
        resolve({
          src,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };

      image.onerror = () => {
        resolve(null);
      };

      image.src = src;
    });
  };

  /*
   * Το NFC δεν αποθηκεύει image URLs ούτε imageCount.
   *
   * Με βάση το cloudName και το cardId δοκιμάζουμε τα γνωστά
   * public ID conventions:
   *
   * cardId.1.jpg
   * cardId.2.jpg
   * cardId.3.jpg
   * cardId.4.jpg
   * cardId.5.jpg
   * cardId.b.jpg
   *
   * Παράδειγμα για cardId = 2:
   * 2.1.jpg
   * 2.2.jpg
   * ...
   * 2.b.jpg
   */
  useEffect(() => {
    const loadCardImages = async () => {
      if (!cardData.cloudName || !cardData.cardId) {
        return;
      }

      const cloudinaryBase =
        `https://res.cloudinary.com/${cardData.cloudName}/image/upload`;

      const regularImageUrls = ["1", "2", "3", "4", "5"].map(
        (imageId) =>
          `${cloudinaryBase}/${cardData.cardId}.${imageId}.jpg`,
      );

      const possiblePhotos = await Promise.all(
        regularImageUrls.map((url) => loadPhoto(url)),
      );

      // Αφαιρούμε όσα URLs δεν αντιστοιχούν σε πραγματική εικόνα.
      const existingPhotos = possiblePhotos.filter(
        (photo): photo is Photo => photo !== null,
      );

      setPhotos(existingPhotos);

      // Το "b" είναι η πίσω όψη της καρτ ποστάλ.
      // Δεν μπαίνει στο RowsPhotoAlbum μαζί με τις κανονικές φωτογραφίες.
      const possibleBackImageUrl =
        `${cloudinaryBase}/${cardData.cardId}.b.jpg`;

      const backImage = await loadPhoto(possibleBackImageUrl);

      if (backImage) {
        setBackImageUrl(backImage.src);
      }
    };

    void loadCardImages();
  }, [cardData]);

  /*
   * Το υπάρχον PhotoViewer συνεχίζει να χρησιμοποιείται
   * για άνοιγμα μιας κανονικής φωτογραφίας σε μεγάλη προβολή.
   *
   * Περνάμε και το countryCode ώστε να κρατήσει το ίδιο background.
   */
  const openPhoto = (src: string) => {
    const params = new URLSearchParams();

    params.set("src", src);

    if (cardData.countryCode) {
      params.set("c", cardData.countryCode);
    }

    window.location.href =
      `${import.meta.env.BASE_URL}photo?${params.toString()}`;
  };

  const handlePhotoClick = (photo: Photo) => {
    openPhoto(photo.src);
  };

  return (
    <>
      <CountryCodeBg countryCode={cardData.countryCode} />

      <main className="relative z-10 min-h-screen py-6">
        {photos.length > 0 && (
          <div className="mx-auto w-[82%] max-w-md px-4">
            <RowsPhotoAlbum
              photos={photos}
              targetRowHeight={160}
              onClick={({ photo }) => handlePhotoClick(photo)}
            />
          </div>
        )}

        {backImageUrl !== "" && (
          <div className="mx-auto mt-6 flex justify-center pb-8">
            <button
              type="button"
              onClick={() => openPhoto(backImageUrl)}
              className="cursor-pointer text-base font-medium text-stone-800 underline underline-offset-4"
            >
              Read postcard
            </button>
          </div>
        )}
      </main>
    </>
  );
};

export default Nfc213Viewer;