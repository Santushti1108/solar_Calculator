import {
  Page,
  View,
  Text,
  Image,
} from "@react-pdf/renderer";

import { styles } from "./pdfStyles";
// import iradeLogo from '../assets/irade-logo.png';

interface Props {
  state: any;
  results: any;
}

export default function CoverPage({
  state,
  results,
}: Props) {
  return (
    <Page size="A4" style={styles.page}>
      <Image
        src="/LOGO.png"
        style={styles.logo}
      />

      <Text style={styles.title}>
        Solar PV + BESS Feasibility Report
      </Text>

      <Text style={styles.subtitle}>
        Integrated Research and Action for Development
      </Text>

      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitle}>
          Project Information
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Project Name</Text>
          <Text style={styles.value}>
            {state.inputs.projectName}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>
            {state.inputs.location}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>System Mode</Text>
          <Text style={styles.value}>
            {state.inputs.systemMode}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Generated On</Text>
          <Text style={styles.value}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Page>
  );
}