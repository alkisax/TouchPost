// native/src/components/StampSvg.tsx

import {
  Circle,
  G,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

type StampSvgProps = {
  x?: number;
  y?: number;
  scale?: number;
};

export default function StampSvg({
  x = 0,
  y = 0,
  scale = 1,
}: StampSvgProps) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Γραμματόσημο */}
      <Rect
        x="80"
        y="5"
        width="90"
        height="110"
        fill="#f8f3e8"
        stroke="#6b6258"
        strokeWidth="2"
      />

      {/* Εσωτερικό πλαίσιο του γραμματοσήμου */}
      <Rect
        x="88"
        y="13"
        width="74"
        height="94"
        fill="#dceaf2"
        stroke="#9a9188"
        strokeWidth="1"
      />

      {/* Ήλιος μέσα στο mock γραμματόσημο */}
      <Circle
        cx="142"
        cy="36"
        r="11"
        fill="#e6b84a"
      />

      {/* Βουνό / τοπίο */}
      <Path
        d="M88 79 L108 54 L122 68 L136 46 L162 79 Z"
        fill="#728b6f"
      />

      {/* Θάλασσα / κάτω μέρος του τοπίου */}
      <Path
        d="M88 79
           C100 73 110 85 122 79
           C134 73 146 85 162 78
           L162 107
           L88 107
           Z"
        fill="#6fa3b8"
      />

      {/* Μικρή ένδειξη χώρας / mock αξίας */}
      <SvgText
        x="94"
        y="27"
        fontSize="8"
        fill="#5f554c"
      >
        TOUCHPOST
      </SvgText>

      <SvgText
        x="150"
        y="101"
        fontSize="8"
        textAnchor="end"
        fill="#5f554c"
      >
        1.00
      </SvgText>

      {/* Εξωτερικός κύκλος ταχυδρομικής σφραγίδας */}
      <Circle
        cx="65"
        cy="55"
        r="32"
        fill="none"
        stroke="#6b6258"
        strokeWidth="2"
      />

      {/* Εσωτερικός κύκλος */}
      <Circle
        cx="65"
        cy="55"
        r="25"
        fill="none"
        stroke="#6b6258"
        strokeWidth="1"
      />

      {/* Κείμενο μέσα στη σφραγίδα */}
      <SvgText
        x="65"
        y="50"
        fontSize="9"
        textAnchor="middle"
        fill="#6b6258"
      >
        TOUCHPOST
      </SvgText>

      <SvgText
        x="65"
        y="65"
        fontSize="8"
        textAnchor="middle"
        fill="#6b6258"
      >
        2026
      </SvgText>

      {/* Κυματιστή γραμμή 1 */}
      <Path
        d="
          M5 38
          C15 30 25 46 35 38
          C45 30 55 46 65 38
          C75 30 85 46 95 38
          C105 30 115 46 125 38
        "
        fill="none"
        stroke="#6b6258"
        strokeWidth="2"
      />

      {/* Κυματιστή γραμμή 2 */}
      <Path
        d="
          M5 55
          C15 47 25 63 35 55
          C45 47 55 63 65 55
          C75 47 85 63 95 55
          C105 47 115 63 125 55
        "
        fill="none"
        stroke="#6b6258"
        strokeWidth="2"
      />

      {/* Κυματιστή γραμμή 3 */}
      <Path
        d="
          M5 72
          C15 64 25 80 35 72
          C45 64 55 80 65 72
          C75 64 85 80 95 72
          C105 64 115 80 125 72
        "
        fill="none"
        stroke="#6b6258"
        strokeWidth="2"
      />
    </G>
  );
}