import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Button, NativeModules } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getOrderById, getOrderLinesByOrderId } from '../database/database';

const { SunmiPrinter } = NativeModules;

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
    const printReceipt = () => {
        try {
            console.log(SunmiPrinter);
            SunmiPrinter.initPrinter(); // Khởi động máy in

            SunmiPrinter.setAlignment(1); // Căn giữa tiêu đề
            SunmiPrinter.printText("=== HÓA ĐƠN THANH TOÁN ===\n", 24, true);
            SunmiPrinter.printText("============================\n", 20);

            // In thông tin đơn hàng
            SunmiPrinter.setAlignment(0); // Căn trái
            SunmiPrinter.printText(`📦 Mã đơn hàng: #${order.id}\n`, 22);
            SunmiPrinter.printText(`💰 Tổng tiền: ${order.amount_total} VND\n`, 22);
            SunmiPrinter.printText(`🤦 Người bán: ${order.saleperson_name}\n`, 20);
            SunmiPrinter.printText(`🤦‍♂️ Người mua: ${order.customer_name}\n`, 20);
            SunmiPrinter.printText(`🧾 Thanh toán: ${order.payment_method_name}\n`, 20);
            SunmiPrinter.printText(`📅 Ngày: ${order.created_at}\n`, 20);
            SunmiPrinter.printText("============================\n", 20);

            // In sản phẩm trong đơn hàng
            orderLines.forEach(item => {
                SunmiPrinter.printText(`${item.product_name} x${item.quantity}\n`, 22);
                SunmiPrinter.printText(`💲 Giá: ${item.price} VND\n`, 20);
                SunmiPrinter.printText("----------------------------\n", 20);
            });

            // Tổng tiền
            SunmiPrinter.setAlignment(2); // Căn phải
            SunmiPrinter.printText(`💵 Tổng: ${order.amount_total} VND\n`, 24, true);
            SunmiPrinter.printText("============================\n", 20);

            SunmiPrinter.autoOutPaper(); // Đẩy giấy ra
            SunmiPrinter.cutPaper(); // Cắt giấy (nếu máy in hỗ trợ)

            alert("✅ In thành công", "Hóa đơn đã được in.");
        } catch (error) {
            console.error("Lỗi in hóa đơn:", error);
            alert("❌ Lỗi in", "Không thể in hóa đơn.");
        }
    };

    if (!order) return <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>;

    return (
        <View style={styles.container}>
            {/* Thông tin đơn hàng */}
            <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>📦 Đơn hàng #{order.id}</Text>
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
