

import HistoryScreen from '@/components/history/history';
import ProfileScreen from '@/components/profile/profile';
import MyRoutesScreen from '@/components/routes/myRoutes';
import ShipmentsScreen from '@/components/shipments/shipments';
import { useSession } from '@/context/SessionContext';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';


const Tab = createBottomTabNavigator();

export default function AppStack() {
  const { role } = useSession();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "black" },
        tabBarActiveTintColor: "black",
        tabBarActiveBackgroundColor: "darkgrey",
        tabBarInactiveTintColor: "white",
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case "Shipments":
              iconName = "cube-outline";
              break;
            case "MyRoutes":
              iconName = "map-outline";
              break;
            case "History":
              iconName = "time-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Shipments" component={RoutesScreen} />
      {role === RoleEnum.REPARTIDOR && (
        <>
          <Tab.Screen name="MyRoutes" component={MyRoutesScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
        </>
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
