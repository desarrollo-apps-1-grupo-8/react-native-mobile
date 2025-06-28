import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PackageInfo {
  id: string;
  packageCode: string;
  description: string;
  weight: string;
  dimensions: string;
  location: string;
  shelf: string;
  recipient: {
    name: string;
    address: string;
    phone: string;
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
  onStartDelivery: () => void;
}

export default function PackageInfoModal({ 
  visible, 
  packageInfo, 
  onClose, 
  onStartDelivery 
}: PackageInfoModalProps) {
  if (!packageInfo) return null;

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
              <View style={styles.infoRow}>
                <Text style={styles.label}>Peso:</Text>
                <Text style={styles.value}>{packageInfo.weight}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Dimensiones:</Text>
                <Text style={styles.value}>{packageInfo.dimensions}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ubicación en Depósito</Text>
              <View style={styles.locationBox}>
                <Ionicons name="location" size={20} color="white" />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>Área: {packageInfo.location}</Text>
                  <Text style={styles.locationText}>Estante: {packageInfo.shelf}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Destinatario</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{packageInfo.recipient.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>{packageInfo.recipient.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{packageInfo.recipient.phone}</Text>
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
                  <Text style={styles.value}>{packageInfo.route.destination}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <Pressable style={styles.startButton} onPress={onStartDelivery}>
            <Text style={styles.startButtonText}>Iniciar Entrega</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
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
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#9BA1A6',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  locationBox: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  locationInfo: {
    marginLeft: 12,
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 18,
  },
});