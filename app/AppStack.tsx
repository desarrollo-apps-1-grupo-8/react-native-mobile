import { useSession } from "@/context/SessionContext";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { MyRoutesScreen } from "@/screens/MyRoutesScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { RoutesScreen } from "@/screens/RoutesScreen";
import { RoleEnum } from "@/utils/roleEnum";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();

export default function AppStack() {
  const { user } = useSession();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#18181b",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          height: Platform.OS === "ios" ? 85 : 100,
          paddingBottom: Platform.OS === "ios" ? 30 : 30,
          paddingTop: 5,
        },
        tabBarActiveTintColor: "#ECEDEE",
        tabBarInactiveTintColor: "#9BA1A6",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string;
          const iconSize = focused ? size + 4 : size;

          switch (route.name) {
            case "Shipments":
              iconName = focused ? "cube" : "cube-outline";
              break;
            case "MyRoutes":
              iconName = focused ? "map" : "map-outline";
              break;
            case "History":
              iconName = focused ? "time" : "time-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return (
            <Ionicons 
              name={iconName as any} 
              size={iconSize} 
              color={color}
              style={{
                textShadowColor: focused ? "rgba(236, 237, 238, 0.3)" : "transparent",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Shipments" 
        component={RoutesScreen}
        options={{
          tabBarLabel: "Envios",
        }}
      />
      {user?.role === RoleEnum.REPARTIDOR && (
        <>
          <Tab.Screen 
            name="MyRoutes" 
            component={MyRoutesScreen}
            options={{
              tabBarLabel: "Mis rutas",
              headerShown: false,
            }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen}
            options={{
              tabBarLabel: "Historial",
            }}
          />
        </>
      )}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
        }}
      />
    </Tab.Navigator>
  );
}
