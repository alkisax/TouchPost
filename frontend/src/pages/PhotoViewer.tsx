// frontend/src/pages/PhotoViewer.tsx

import CountryCodeBg from "../components/CountryCodeBg";

const PhotoViewer = () => {
  const params = new URLSearchParams(window.location.search);

  const imageUrl = params.get("src") ?? "";
  const countryCode = params.get("c") ?? undefined;

  return (
    <>
      <CountryCodeBg countryCode={countryCode} />

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        {imageUrl !== "" && (
          <img
            src={imageUrl}
            alt="TouchPost photo"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        )}
      </main>
    </>
  );
};

export default PhotoViewer;