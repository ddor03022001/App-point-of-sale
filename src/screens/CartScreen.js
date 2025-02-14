import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createOrder } from '../database/database';
import { createSessionResponse, createPosOrder } from '../api/odooApi';

const CartScreen = ({ cart, setCart }) => {
    // Hàm tăng số lượng
    const increaseQuantity = (id) => {
        const newCart = cart.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCart(newCart);
    };

    // Hàm giảm số lượng
    const decreaseQuantity = (id) => {
        const newCart = cart
            .map((item) =>
                item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0); // Xoá sản phẩm nếu số lượng về 0
        setCart(newCart);
    };

    // Hàm xoá sản phẩm khỏi giỏ hàng
    const removeItem = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    // Tính tổng giá trị giỏ hàng
    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.list_price * item.quantity, 0);
    };

    // Hàm thanh toán
    // const handleCheckout = async () => {
    //     await createOrder(getTotalPrice(), "Chuyển khoản"); // Tạo đơn hàng
    //     Alert.alert("Thanh toán thành công", "Cảm ơn bạn đã mua hàng!", [
    //         { text: "OK", onPress: () => setCart([]) } // Xóa giỏ hàng sau khi nhấn OK
    //     ]);
    // };
    const handleCheckout = async () => {
        const response = await createPosOrder();
        console.log(response);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛒 Giỏ hàng của bạn</Text>

            {cart.length === 0 ? (
                <Text style={styles.emptyText}>Giỏ hàng trống 😢</Text>
            ) : (
                <FlatList
                    data={cart}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <Image source={{ uri: `data:image/png;base64,${item.image_medium}` }} style={styles.cartImage} />
                            <View style={styles.cartInfo}>
                                <Text style={styles.cartName}>{item.name}</Text>
                                <Text style={styles.cartPrice}>
                                    {item.list_price.toLocaleString()}đ
                                </Text>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => decreaseQuantity(item.id)}
                                    >
                                        <Ionicons name="remove-circle-outline" size={24} color="#ff5733" />
                                    </TouchableOpacity>

                                    <Text style={styles.quantityText}>{item.quantity}</Text>

                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => increaseQuantity(item.id)}
                                    >
                                        <Ionicons name="add-circle-outline" size={24} color="#28a745" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeItem(item.id)}
                            >
                                <Ionicons name="trash-outline" size={24} color="#ff0000" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Tổng tiền */}
            {cart.length > 0 && (
                <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Tổng tiền: {getTotalPrice().toLocaleString()}đ</Text>
                    <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={handleCheckout}
                    >
                        <Text style={styles.checkoutText}>Thanh toán</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
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
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff5733',
    },
    checkoutButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, marginTop: 10, width: '100%', alignItems: 'center' },
    checkoutText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});
