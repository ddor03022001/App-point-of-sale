import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getOrders } from '../database/database';

const OrderHistoryScreen = () => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        const orderList = await getOrders(); // Lấy danh sách đơn hàng
        setOrders(orderList);
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders(); // Load lại danh sách đơn hàng khi màn hình được focus
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lịch Sử Mua Hàng</Text>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.orderItem}>
                        <Text>🛒 Đơn hàng #{item.id}</Text>
                        <Text>💰 Tổng tiền: {item.total_price} VND</Text>
                        <Text>🧾 Thanh toán: {item.payment_method}</Text>
                        <Text>📅 Ngày mua: {item.created_at}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    orderItem: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
});

export default OrderHistoryScreen;
