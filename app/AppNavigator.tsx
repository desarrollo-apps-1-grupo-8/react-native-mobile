import Loader from "@/components/ui/Loader";
import NetworkStatus from "@/components/ui/NetworkStatus";
import { useSession } from "@/context/SessionContext";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import Toast from "react-native-toast-message";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";

export default function AppNavigator() {
  const { session, isLoading } = useSession();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.target === "Shipments") {
          navigationRef.current?.navigate("Shipments");
        }

        //redireccion a mis envios
        if (data?.target === "MyRoutes") {
          navigationRef.current?.navigate("MyRoutes");
        }
      }
    );

    return () => subscription.remove();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <StatusBar style="light" translucent={true} />
      <NetworkStatus />
      <NavigationContainer ref={navigationRef}>
        {session ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
      <Toast />
    </>
  );
}
