import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import CartScreen from './src/screens/CartScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import { setupDatabase } from './src/database/database';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = ({ cart, setCart, setIsLoggedIn }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home-outline';
        else if (route.name === 'Cart') iconName = 'cart-outline';
        else if (route.name === 'Profile') iconName = 'person-outline';
        else if (route.name === 'OrderHistory') iconName = 'time-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { paddingBottom: 5, height: 60 },
    })}
  >
    <Tab.Screen name="Home">
      {(props) => <HomeScreen {...props} cart={cart} setCart={setCart} />}
    </Tab.Screen>
    <Tab.Screen name="Cart">
      {(props) => <CartScreen {...props} cart={cart} setCart={setCart} />}
    </Tab.Screen>
    <Tab.Screen name="OrderHistory">
      {(props) => <OrderHistoryScreen {...props} />}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {(props) => <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
    </Tab.Screen>
  </Tab.Navigator>
);

export default function App() {
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setupDatabase(); // ✅ Tạo database khi app khởi chạy
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => <TabNavigator cart={cart} setCart={setCart} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ headerShown: true, title: "Thanh toán" }}
            ></Stack.Screen>
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ headerShown: true, title: "Chi tiết đơn hàng" }}
            ></Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
