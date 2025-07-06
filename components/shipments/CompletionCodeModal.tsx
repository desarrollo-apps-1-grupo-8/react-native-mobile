import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface CompletionCodeModalProps {
  visible: boolean;
  onClose: () => void;
  completionCode: string;
}

export default function CompletionCodeModal({ 
  visible, 
  onClose, 
  completionCode 
}: CompletionCodeModalProps) {
  const screenWidth = Dimensions.get('window').width;
  const digitSize = Math.min(40, (screenWidth * 0.7) / 8);
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={70} style={styles.blurContainer}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.iconContainer}>
              <Feather name="shield" size={48} color="#fff" />
            </View>
            
            <Text style={styles.title}>Código de entrega</Text>
            
            <Text style={styles.subtitle}>
              Este es el código que debes darle al repartidor para que pueda entregarte el paquete. 
              No lo compartas con nadie.
            </Text>
            
            <View style={styles.codeContainer}>
              {completionCode.split('').map((digit, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.codeBox,
                    { width: digitSize, height: digitSize * 1.25 }
                  ]}
                >
                  <Text style={styles.codeDigit}>{digit}</Text>
                </View>
              ))}
            </View>
            
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 400,
    margin: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
  },
  codeBox: {
    borderWidth: 2,
    borderColor: '#555',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  codeDigit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 