// frontend/src/components/images/ImageListFrame.tsx
import { PRIMARY_COLOR } from "../../constants/constants";
import ImageProtectionOverlay from "./ImageProtectionOverlay";

type ImageListFrameProps = {
  src: string;
  alt: string;
  interactive?: boolean;
  showMobileIcon?: boolean;
  onClick?: () => void;
};

const ImageListFrame = ({
  src,
  alt,
  interactive = false,
  showMobileIcon = false,
  onClick,
}: ImageListFrameProps) => {



  return (
    // group: επιτρέπει στα παιδιά να αντιδρούν στο hover του frame
    // relative: reference point για τα absolute στοιχεία
    // w-64: πλάτος σε mobile
    // md:w-52: πλάτος σε desktop
    <div
      className="
      group
      relative
      w-64
      md:w-52
    "
      onClick={onClick}
    >
      {/* Εξωτερικό frame: μετατοπισμένο δεξιά και κάτω από τη φωτογραφία */}
      <div
        className="
          absolute
          left-4
          top-4
          h-full
          w-full
          border
        "
        style={{ borderColor: PRIMARY_COLOR }}
      />

      {/* Η εικόνα βρίσκεται πάνω από το εξωτερικό frame */}
      <div className="relative z-10">
        <img
          src={src}
          alt={alt}
          className="
            relative
            z-10
            block
            h-auto
            w-full
          "
        />

        {/* εμποδίζει click και drag */}
        <ImageProtectionOverlay />

        {/* για να δείχνουμε τον μεγεθυντικό φακο. default false */}
        {/* 
          absolute: overlay επάνω στην εικόνα
          inset-0: ίδιες διαστάσεις με την εικόνα
          z-20: πάνω από την εικόνα
          transition-opacity: ομαλή εμφάνιση
          duration-200: 200ms transition
          md:opacity-0: σε desktop είναι κρυφό από default
          md:group-hover:opacity-100: σε desktop εμφανίζεται στο hover
        */}
        {interactive && (
          <div
            className={`
              absolute
              inset-0
              z-20
              transition-opacity
              duration-200
              ${showMobileIcon ? "opacity-100" : "opacity-0"}
              md:opacity-0
              md:group-hover:opacity-100
            `}
          >
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageListFrame;