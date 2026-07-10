import { Page, Text } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

export default function SummaryPage() {
  return (
    <Page size="A4" style={styles.page}>
      <Text>Summary Page</Text>
    </Page>
  );
}