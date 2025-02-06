// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import LoginScreen from './src/screens/LoginScreen';
// import ProductScreen from './src/screens/ProductScreen';

// const Stack = createStackNavigator();

// const App = () => {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Đăng nhập Odoo' }} />
//         <Stack.Screen name="ProductScreen" component={ProductScreen} options={{ title: 'Danh sách sản phẩm' }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default App;

import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import CartScreen from './src/screens/CartScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [cart, setCart] = useState([]); // State lưu trữ giỏ hàng

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            // Kiểm tra route và xác định icon name
            const iconName: 'home-outline' | 'cart-outline' =
              route.name === 'Home' ? 'home-outline' : 'cart-outline';

            // Trả về icon với name, size và color hợp lệ
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home">
          {(props) => <HomeScreen {...props} cart={cart} setCart={setCart} />}
        </Tab.Screen>
        <Tab.Screen name="Cart">
          {(props) => <CartScreen {...props} cart={cart} setCart={setCart} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
