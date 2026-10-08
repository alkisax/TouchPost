import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { wrapPostcardText } from '@/utils/wrapPostcardText';
import StampSvg from '@/components/StampSvg';

type BackOfPostcardSvgProps = {
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  from?: string;
  sentFrom?: string;
  text?: string;
  width?: number;
};
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

export default function BackOfPostcardSvg({
  address = '',
  city = '',
  country = '',
  postalCode = '',
  from = '',
  sentFrom = '',
  text = '',
  width = 350,
}: BackOfPostcardSvgProps) {
  // Το τελικό ύψος του preview προκύπτει αναλογικά,
  // ώστε η postcard να κρατά σωστές διαστάσεις όταν γίνεται scale down.
  const height = width * (CANVAS_HEIGHT / CANVAS_WIDTH);

  // Σταθερές θέσεων μέσα στο SVG canvas.
  const padding = 40;
  const centerX = CANVAS_WIDTH / 2;

  // Σπάμε το μήνυμα σε πολλές γραμμές για να χωράει
  // στην αριστερή πλευρά της καρτ ποστάλ.
  const messageLines = wrapPostcardText(text);

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Φόντο της πίσω όψης της καρτ ποστάλ */}
      <Rect
        x="0"
        y="0"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        fill="#f6f0e4"
      />

      {/* Κεντρική κάθετη γραμμή που χωρίζει το μήνυμα από τη διεύθυνση */}
      <Line
        x1={centerX}
        y1={padding}
        x2={centerX}
        y2={CANVAS_HEIGHT - padding}
        stroke="#6b6258"
        strokeWidth="2"
      />

      {/* Τίτλος του αριστερού μέρους όπου γράφεται το μήνυμα */}
      <SvgText x={padding} y={70} fontSize="26" fill="#2f2a26">
        Message
      </SvgText>

      {/* Οι γραμμές του κειμένου του μηνύματος, μετά το wrapping */}
      {messageLines.map((line, index) => (
        <SvgText
          key={index}
          x={padding}
          y={120 + index * 30}
          fontSize="24"
          fontFamily="NotoSans_400Regular"
          fill="#2f2a26"
        >
          {line}
        </SvgText>
      ))}

      {/* Υπογραφή / αποστολέας στο κάτω μέρος της αριστερής πλευράς */}
      {/* Υπογραφή / αποστολέας */}
      <SvgText
        x={padding}
        y={CANVAS_HEIGHT - 80}
        fontSize="22"
        fill="#2f2a26"
      >
        From: {from}
      </SvgText>

      {/* Προαιρετικό σημείο αποστολής της καρτ ποστάλ */}
      {sentFrom && (
        <SvgText
          x={padding}
          y={CANVAS_HEIGHT - 50}
          fontSize="18"
          fill="#2f2a26"
        >
          Sent from: {sentFrom}
        </SvgText>
      )}

      <StampSvg
        x={CANVAS_WIDTH - 190}
        y={30}
        scale={1}
      />

      {/* Τίτλος της δεξιάς πλευράς όπου γράφεται ο παραλήπτης */}
      <SvgText x={centerX + 40} y={190} fontSize="24" fill="#2f2a26">
        To:
      </SvgText>

      {/* 1η γραμμή: διεύθυνση */}
      <Line
        x1={centerX + 40}
        y1={250}
        x2={CANVAS_WIDTH - 60}
        y2={250}
        stroke="#9a9188"
        strokeWidth="1"
      />
      <SvgText x={centerX + 40} y={242} fontSize="20" fill="#2f2a26">
        {address}
      </SvgText>

      {/* 2η γραμμή: πόλη */}
      <Line
        x1={centerX + 40}
        y1={300}
        x2={CANVAS_WIDTH - 60}
        y2={300}
        stroke="#9a9188"
        strokeWidth="1"
      />
      <SvgText x={centerX + 40} y={292} fontSize="20" fill="#2f2a26">
        {city}
      </SvgText>

      {/* 3η γραμμή: χώρα */}
      <Line
        x1={centerX + 40}
        y1={350}
        x2={CANVAS_WIDTH - 60}
        y2={350}
        stroke="#9a9188"
        strokeWidth="1"
      />
      <SvgText x={centerX + 40} y={342} fontSize="20" fill="#2f2a26">
        {country}
      </SvgText>

      {/* 4η γραμμή: ταχυδρομικός κώδικας */}
      <Line
        x1={centerX + 40}
        y1={400}
        x2={CANVAS_WIDTH - 60}
        y2={400}
        stroke="#9a9188"
        strokeWidth="1"
      />
      <SvgText x={centerX + 40} y={392} fontSize="20" fill="#2f2a26">
        {postalCode}
      </SvgText>
    </Svg>
  );
}