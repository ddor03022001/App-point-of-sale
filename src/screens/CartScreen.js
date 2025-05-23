import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createOrder } from '../database/database';
import { createSessionResponse, createPosOrder } from '../api/odooApi';
import { useNavigation } from '@react-navigation/native';

const CartScreen = ({ cart, setCart }) => {

    const navigation = useNavigation();
    // Hàm tăng số lượng
    // const increaseQuantity = (id) => {
    //     const newCart = cart.map((item) =>
    //         item.id === id ? { ...item, quantity: parseFloat(item.quantity) + 1.0 } : item
    //     );
    //     setCart(newCart);
    // };

    // Hàm giảm số lượng
    // const decreaseQuantity = (id) => {
    //     const newCart = cart
    //         .map((item) =>
    //             item.id === id ? { ...item, quantity: parseFloat(item.quantity) - 1.0 } : item
    //         )
    //         .filter((item) => item.quantity > 0); // Xoá sản phẩm nếu số lượng về 0
    //     setCart(newCart);
    // };

    // Hàm xóa sản phẩm khỏi giỏ hàng
    const removeItem = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    // Tính tổng giá trị giỏ hàng
    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.list_price * item.quantity, 0);
    };

    const handleQuantityChange = (id, value) => {
        if (value === ".") {
            return;
        }
        let newValue = value.replace(/[^0-9.]/g, "");
        const dotCount = (newValue.match(/\./g) || []).length;
        if (dotCount > 1) return;

        if (newValue.includes(".")) {
            let [intPart, decimalPart] = newValue.split(".");
            decimalPart = decimalPart.slice(0, 3); // Giới hạn 3 chữ số sau dấu .
            newValue = decimalPart !== undefined ? `${intPart}.${decimalPart}` : intPart;
        }
        setCart(prevProducts =>
            prevProducts.map(item =>
                item.id === id ? { ...item, quantity: newValue } : item
            )
        );
    };

    // Hàm thanh toán
    // const handleCheckout = async () => {
    //     await createOrder(getTotalPrice(), "Chuyển khoản"); // Tạo đơn hàng
    //     Alert.alert("Thanh toán thành công", "Cảm ơn bạn đã mua hàng!", [
    //         { text: "OK", onPress: () => setCart([]) } // Xóa giỏ hàng sau khi nhấn OK
    //     ]);
    // };
    const handleCheckout = async () => {
        navigation.navigate("Checkout");
    };

    return (
        < ScrollView >
            <View style={styles.container}>
                <Text style={styles.title}>🛒 Giỏ hàng của bạn</Text>

                {cart.length === 0 ? (
                    <Text style={styles.emptyText}>Giỏ hàng trống 😢</Text>
                ) : (
                    cart.map((item, index) => (
                        <View key={`${item.id}-${index}`} style={styles.cartItem}>
                            {/* <Image source={{ uri: `data:image/png;base64,${item.image_medium}` }} style={styles.cartImage} /> */}
                            <View style={styles.cartInfo}>
                                <Text style={styles.cartName}>{item.name}</Text>
                                <Text style={styles.cartPrice}>
                                    {item.list_price.toLocaleString()} VND
                                </Text>
                                <View style={styles.quantityContainer}>
                                    {/* <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => decreaseQuantity(item.id)}
                                    >
                                        <Ionicons name="remove-circle-outline" size={24} color="#ff5733" />
                                    </TouchableOpacity> */}
                                    <Text>Số lượng: </Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={item.quantity.toString()}
                                        onChangeText={(text) => handleQuantityChange(item.id, text)}
                                    />
                                    {/* 
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => increaseQuantity(item.id)}
                                    >
                                        <Ionicons name="add-circle-outline" size={24} color="#28a745" />
                                    </TouchableOpacity> */}
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeItem(item.id)}
                            >
                                <Ionicons name="trash-outline" size={24} color="#ff0000" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                {/* Tổng tiền */}
                {cart.length > 0 && (
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Tổng tiền: {getTotalPrice().toLocaleString()} VND</Text>
                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.checkoutText}>Thanh toán</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default CartScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cartImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
        marginRight: 10,
    },
    cartInfo: {
        flex: 1,
    },
    cartName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartPrice: {
        fontSize: 14,
        color: '#ff5733',
        marginVertical: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        padding: 5,
    },
    quantityText: {
        fontSize: 18,
        marginHorizontal: 10,
    },
    removeButton: {
        padding: 5,
    },
    totalContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        padding: 8,
        borderRadius: 5,
        textAlign: "center",
        fontSize: 16,
        color: "red",
        fontWeight: "bold",
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff5733',
    },
    checkoutButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, marginTop: 10, width: '100%', alignItems: 'center' },
    checkoutText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});
