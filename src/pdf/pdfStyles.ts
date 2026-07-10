import { StyleSheet } from "@react-pdf/renderer"
export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#333",
  },

  logo: {
    width: 140,
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    textAlign: "center",
    color: "#C85A00",
    marginBottom: 8,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 13,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    color: "#C85A00",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#C85A00",
    paddingBottom: 4,
  },

  row: {
    flexDirection: "row",
    marginBottom: 8,
  },

  label: {
    width: 120,
    fontWeight: "bold",
  },

  value: {
    flex: 1,
  },
});