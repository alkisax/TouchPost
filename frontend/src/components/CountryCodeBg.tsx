type CountryCodeBgProps = {
  countryCode?: string;
};

const CountryCodeBg = ({ countryCode }: CountryCodeBgProps) => {
  if (!countryCode) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-0 h-screen w-screen bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}countries/${countryCode}.jpeg)`,
        backgroundSize: "100% 100%",
      }}
    />
  );
};

export default CountryCodeBg;