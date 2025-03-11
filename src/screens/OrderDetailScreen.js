import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getOrderById, getOrderLinesByOrderId } from '../database/database';
import * as Print from 'expo-print';

const OrderDetailScreen = () => {
    const route = useRoute();
    const { orderId } = route.params; // Nhận orderId từ navigation
    const [order, setOrder] = useState(null);
    const [orderLines, setOrderLines] = useState([]);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const orderData = await getOrderById(orderId);
            const orderLinesData = await getOrderLinesByOrderId(orderId);
            setOrder(orderData);
            setOrderLines(orderLinesData);
        };

        fetchOrderDetails();
    }, [orderId]);

    // Hàm in hóa đơn
    const printReceipt = async () => {
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        width: 100%;
                        margin: 0;
                        font-family: Arial, sans-serif;
                        padding: 0;
                        font-size: 12px;
                    }
                    h1 { 
                        text-align: center; 
                        font-size: 18px;
                        margin: 0;
                    }
                    p { 
                        font-size: 12px; 
                        line-height: 1.5;
                        margin: 3px 0;
                        padding: 0;
                    }
                    hr { 
                        margin: 10px 0; 
                        border: 0.5px solid #ccc;
                    }
                    .table { 
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        padding: 0;
                    }
                    .table th, .table td { 
                        padding: 5px;
                        border: 1px solid #ddd;
                        text-align: left;
                        font-size: 12px;
                        margin: 0;
                    }
                    .table th {
                        background-color: #f4f4f4;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 10px;
                        padding: 0;
                    }
                </style>
            </head>
            <body>
                <h1>Đơn hàng #${order.name}</h1>
                <p><strong>Tổng tiền:</strong> ${order.amount_total} VND</p>
                <p><strong>Người bán:</strong> ${order.saleperson_name}</p>
                <p><strong>Người mua:</strong> ${order.customer_name}</p>
                <p><strong>Thanh toán:</strong> ${order.payment_method_name}</p>
                <p><strong>Ngày mua:</strong> ${order.created_at}</p>
                <hr>
    
                <table class="table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá (VND)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderLines.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.quantity}</td>
                                <td>${item.price}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
    
                <hr>
                <div class="footer">
                    <p>Cảm ơn quý khách đã mua sắm!</p>
                </div>
            </body>
        </html>
        `;

        try {
            await Print.printAsync({ html: htmlContent });
        } catch (error) {
            console.error("Lỗi in hóa đơn:", error);
        }
    };


    if (!order) return <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>;

    return (
        <View style={styles.container}>
            {/* Thông tin đơn hàng */}
            <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>📦 Đơn hàng #{order.name}</Text>
                <Text style={styles.orderText}>💰 Tổng tiền: {order.amount_total} VND</Text>
                <Text style={styles.orderText}>🤦‍♂️ Người bán: {order.saleperson_name}</Text>
                <Text style={styles.orderText}>🤦 Người mua: {order.customer_name}</Text>
                <Text style={styles.orderText}>🧾 Thanh toán: {order.payment_method_name}</Text>
                <Text style={styles.orderText}>📅 Ngày mua: {order.created_at}</Text>
            </View>

            {/* Danh sách sản phẩm trong đơn hàng */}
            <Text style={styles.sectionTitle}>🛍️ Sản phẩm đã mua</Text>
            <FlatList
                data={orderLines}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.productImage} />
                        <View style={styles.productDetails}>
                            <Text style={styles.productName}>{item.product_name}</Text>
                            <Text style={styles.productText}>💲 Giá: {item.price} VND</Text>
                            <Text style={styles.productText}>📦 Số lượng: {item.quantity}</Text>
                            <Text style={styles.productText}>🛡️ Thuế: {item.tax_id}</Text>
                        </View>
                    </View>
                )}
            />
            {/* Nút in hóa đơn */}
            <View style={styles.buttonContainer}>
                <Button title="🖨️ In hóa đơn" onPress={printReceipt} color="#007bff" />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    loadingText: { textAlign: 'center', fontSize: 16, marginTop: 20 },
    orderInfo: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    orderTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    orderText: { fontSize: 14, marginBottom: 3 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginVertical: 5,
    },
    productImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
    productDetails: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold' },
    productText: { fontSize: 14, color: '#555' },
    buttonContainer: { marginTop: 20, alignItems: 'center' },
});

export default OrderDetailScreen;
