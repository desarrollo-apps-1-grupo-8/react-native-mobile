import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { openLocationInMaps } from "../../utils/mapUtils";

interface PackageInfo {
  id: string;
  packageCode: string;
  description: string;
  recipient: {
    name: string;
    address: string;
  };
  route?: {
    id: number;
    origin: string;
    destination: string;
  };
}

interface PackageInfoModalProps {
  visible: boolean;
  packageInfo: PackageInfo | null;
  onClose: () => void;
}

export default function PackageInfoModal({
  visible,
  packageInfo,
  onClose,
}: PackageInfoModalProps) {
  if (!packageInfo) return null;

  const handleOpenMaps = () => {
    if (packageInfo.route && packageInfo.route.destination) {
      openLocationInMaps(packageInfo.route.destination);
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Información del Paquete</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#9BA1A6" />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalles del Paquete</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Código:</Text>
                <Text style={styles.value}>{packageInfo.packageCode}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Descripción:</Text>
                <Text style={styles.value}>{packageInfo.description}</Text>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Información del Destinatario
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{packageInfo.recipient.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>
                  {packageInfo.recipient.address}
                </Text>
              </View>
            </View>

            {packageInfo.route && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ruta de Entrega</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>ID Ruta:</Text>
                  <Text style={styles.value}>#{packageInfo.route.id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Origen:</Text>
                  <Text style={styles.value}>{packageInfo.route.origin}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Destino:</Text>
                  <Text style={styles.value}>
                    {packageInfo.route.destination}
                  </Text>
                </View>
                <Pressable style={styles.mapsButton} onPress={handleOpenMaps}>
                  <Ionicons
                    name="location"
                    size={20}
                    color="white"
                    style={styles.mapsIcon}
                  />
                  <Text style={styles.mapsButtonText}>
                    Ver ubicación en Maps
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1c1c1c",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: 400,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#9BA1A6",
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  mapsButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mapsIcon: {
    marginRight: 8,
  },
  mapsButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
