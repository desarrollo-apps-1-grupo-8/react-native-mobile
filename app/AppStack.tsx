
import HistoryScreen from '@/components/history/history';
import ProfileScreen from '@/components/profile/profile';
import MyRoutesScreen from '@/components/routes/myRoutes';
import ShipmentsScreen from '@/components/shipments/shipments';
import { useSession } from '@/context/SessionContext';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function AppStack() {
  const { session } = useSession();
  const isDeliveryRole = getUserRoleFromToken();   /// Verifica si el rol es repartidor ACOMODAR

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: 'black' },
        tabBarActiveTintColor: 'grey',
        tabBarInactiveTintColor: 'white',
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Shipments':
              iconName = 'cube-outline';
              break;
            case 'MyRoutes':
              iconName = 'map-outline';
              break;
            case 'History':
              iconName = 'time-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Shipments" component={ShipmentsScreen} />
      {isDeliveryRole && <Tab.Screen name="MyRoutes" component={MyRoutesScreen} />}
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function getUserRoleFromToken() {
  throw new Error('Function not implemented.');
}
