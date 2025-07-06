import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface CompletionCodeInputProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
  routeId: number;
}

type VerificationStatus = "idle" | "success" | "error" | "loading";

export default function CompletionCodeInput({
  visible,
  onClose,
  onSubmit,
  routeId,
}: CompletionCodeInputProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;
  const inputScales = useRef(code.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setCode(["", "", "", "", "", ""]);
      setVerificationStatus("idle");
      setStatusMessage("");
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [visible]);

  const animateError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateStatus = (show: boolean) => {
    Animated.timing(statusOpacity, {
      toValue: show ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateInput = (index: number, focused: boolean) => {
    Animated.spring(inputScales[index], {
      toValue: focused ? 1.1 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const resetStatus = () => {
    setVerificationStatus("idle");
    setStatusMessage("");
    animateStatus(false);
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text && !/^\d+$/.test(text)) return;

    resetStatus();
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (text && index === 5) {
      const completeCode = [...newCode].join("");
      if (completeCode.length === 6) {
        handleVerify(completeCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  const handleVerify = async (completionCode: string) => {
    try {
      setVerificationStatus("loading");
      await onSubmit(completionCode);

      setVerificationStatus("success");
      setStatusMessage("Entrega confirmada correctamente");
      animateStatus(true);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setVerificationStatus("error");
      setStatusMessage(error.message || "Código inválido");
      animateStatus(true);
      animateError();
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={70} style={styles.blurContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Feather name="package" size={32} color="white" />
              </View>
              <Text style={styles.title}>Confirmar entrega</Text>
              <Text style={styles.subtitle}>
                Ingresá el código de 6 dígitos proporcionado por el cliente
              </Text>
              <Text style={styles.routeId}>Ruta #{routeId}</Text>
            </View>

            <Animated.View
              style={[
                styles.codeContainer,
                { transform: [{ translateX: shakeAnimation }] },
              ]}
            >
              {code.map((digit, index) => (
                <Animated.View
                  key={index}
                  style={[{ transform: [{ scale: inputScales[index] }] }]}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                      verificationStatus === "loading" &&
                        styles.codeInputDisabled,
                      verificationStatus === "success" &&
                        styles.codeInputSuccess,
                      verificationStatus === "error" && styles.codeInputError,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => animateInput(index, true)}
                    onBlur={() => animateInput(index, false)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectionColor="white"
                    editable={
                      verificationStatus !== "loading" &&
                      verificationStatus !== "success"
                    }
                  />
                </Animated.View>
              ))}
            </Animated.View>

            <Animated.Text
              style={[
                styles.statusMessage,
                verificationStatus === "success" && styles.statusMessageSuccess,
                verificationStatus === "error" && styles.statusMessageError,
                { opacity: statusOpacity },
              ]}
            >
              {statusMessage}
            </Animated.Text>

            <View style={styles.footer}>
              <Pressable
                style={styles.cancelButton}
                onPress={onClose}
                disabled={
                  verificationStatus === "loading" ||
                  verificationStatus === "success"
                }
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  modalView: {
    width: "100%",
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 400,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 8,
  },
  routeId: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  codeInput: {
    width: "14%",
    minWidth: 40,
    maxWidth: 50,
    height: 56,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 12,
    color: "white",
    fontSize: 24,
    textAlign: "center",
    backgroundColor: "transparent",
    fontWeight: "600",
    marginHorizontal: "1%",
  },
  codeInputFilled: {
    borderColor: "#666",
    backgroundColor: "#222",
  },
  codeInputDisabled: {
    opacity: 0.5,
  },
  codeInputSuccess: {
    borderColor: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  codeInputError: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  footer: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#333",
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  statusMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  statusMessageSuccess: {
    color: "#22c55e",
  },
  statusMessageError: {
    color: "#ef4444",
  },
});
