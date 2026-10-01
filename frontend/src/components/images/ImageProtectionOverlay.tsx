type ImageProtectionOverlayProps = {
  className?: string;
};

const ImageProtectionOverlay = ({
  className,
}: ImageProtectionOverlayProps) => {
  return (
    <div
      // absolute: το overlay τοποθετείται πάνω από την εικόνα
      // inset-0: καλύπτει όλη την επιφάνεια του parent
      // z-30: βρίσκεται πάνω από την εικόνα και το zoom overlay
      // select-none: εμποδίζει selection
      // ${className ?? ""} σημαίνει: αν μου δώσεις επιπλέον classes, πρόσθεσέ τες· αλλιώς βάλε κενό string.
      className={`
        absolute
        inset-0
        z-30
        select-none
        ${className ?? ""}
      `}
      onContextMenu={(event) => event.preventDefault()} // Μπλοκάρει το δεξί click πάνω στην εικόνα
      onDragStart={(event) => event.preventDefault()} // Εμποδίζει το drag της εικόνας προς desktop/tab
      aria-hidden="true" // Το overlay δεν έχει νοηματικό περιεχόμενο για screen readers
    />
  );
};

export default ImageProtectionOverlay;