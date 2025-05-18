import ShipmentsScreen from '@/components/shipments/shipments';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import your main app screens here

const Tab = createBottomTabNavigator();

export default function AppStack() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
           <Tab.Screen name="Home" component={ShipmentsScreen} />
    </Tab.Navigator>
  );
}