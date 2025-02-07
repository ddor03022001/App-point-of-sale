import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createOrder, setupDatabase } from '../database/database';

const CheckoutScreen = ({ route, navigation }) => {
    const { totalPrice } = route.params;
    const [paymentMethod, setPaymentMethod] = useState(null);

    const handleConfirm = () => {
        if (!paymentMethod) {
            Alert.alert('Chọn phương thức thanh toán', 'Vui lòng chọn phương thức thanh toán trước khi xác nhận.');
            return;
        }

        createOrder(totalPrice, paymentMethod, (orderId) => {
            Alert.alert('Đặt hàng thành công', `Đơn hàng #${orderId} đã được tạo.`);
            navigation.navigate('Cart');
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chọn phương thức thanh toán</Text>
            <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'cash' && styles.selected]}
                onPress={() => setPaymentMethod('cash')}
            >
                <Text style={styles.paymentText}>💵 Thanh toán tiền mặt</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'card' && styles.selected]}
                onPress={() => setPaymentMethod('card')}
            >
                <Text style={styles.paymentText}>💳 Thanh toán thẻ</Text>
            </TouchableOpacity>

            <Text style={styles.totalText}>Tổng tiền: {totalPrice.toLocaleString()}đ</Text>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmText}>Xác nhận đơn hàng</Text>
            </TouchableOpacity>
        </View>
    );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    paymentOption: { width: '80%', padding: 15, marginVertical: 10, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' },
    selected: { backgroundColor: '#ddd' },
    paymentText: { fontSize: 18 },
    totalText: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
    confirmButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, marginTop: 20 },
    confirmText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});
