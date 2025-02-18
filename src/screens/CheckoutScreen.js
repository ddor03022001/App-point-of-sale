import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const customers = [
    { id: 1, name: "Nguyễn Văn A" },
    { id: 2, name: "Trần Thị B" },
    { id: 3, name: "Lê Văn C" },
    { id: 4, name: "Phạm Văn D" },
    { id: 5, name: "Phạm Văn E" },
    { id: 6, name: "Phạm Văn F" },
    { id: 7, name: "Phạm Văn G" },
];

const CheckoutScreen = ({ navigation, route }) => {
    const { cart } = route.params;
    const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản");
    const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
    const [isCustomerModalVisible, setCustomerModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    const totalAmount = cart.reduce((total, item) => total + item.list_price * item.quantity, 0).toLocaleString();

    const handleConfirmOrder = () => {
        alert(`Đơn hàng đã được xác nhận!\nKhách hàng: ${selectedCustomer.name}\nPhương thức thanh toán: ${paymentMethod}`);
        navigation.goBack();
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchText.toLowerCase())
    ).slice(0, 5);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Xác nhận đơn hàng</Text>
            </View>

            {/* Danh sách sản phẩm */}
            {cart.length > 0 ? (
                <FlatList
                    data={cart}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <View style={styles.itemColumn}>
                                <Text style={styles.itemText}>{item.name}</Text>
                            </View>
                            <View style={styles.itemColumn}>
                                <Text style={styles.itemText}>{item.quantity}</Text>
                            </View>
                            <View style={styles.itemColumn}>
                                <Text style={styles.itemPrice}>{(item.list_price * item.quantity).toLocaleString()} VND</Text>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>Giỏ hàng trống</Text>
            )}

            {/* Chọn khách hàng */}
            <Text style={styles.sectionTitle}>Khách hàng</Text>
            <TouchableOpacity style={styles.customerSelect} onPress={() => setCustomerModalVisible(true)}>
                <Text style={styles.customerSelectText}>{selectedCustomer.name}</Text>
                <Ionicons name="chevron-down" size={20} color="black" />
            </TouchableOpacity>

            {/* Modal chọn khách hàng */}
            <Modal visible={isCustomerModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn khách hàng</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm khách hàng..."
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        <FlatList
                            data={filteredCustomers}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.customerItem}
                                    onPress={() => {
                                        setSelectedCustomer(item);
                                        setCustomerModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.customerItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setCustomerModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Chọn phương thức thanh toán */}
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentMethods}>
                <FlatList
                    data={["Chuyển khoản", "Tiền mặt", "Ví điện tử", "Momo", "ZaloPay"]} // Bạn có thể thêm phương thức thanh toán tùy thích
                    keyExtractor={(item) => item}
                    horizontal={true} // Cuộn ngang
                    showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                paymentMethod === item && styles.paymentButtonSelected,
                            ]}
                            onPress={() => setPaymentMethod(item)}
                        >
                            <Text>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Tổng tiền + Nút xác nhận */}
            <View style={styles.summary}>
                <Text style={styles.totalText}>Tổng tiền: {totalAmount} VND</Text>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
                    <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
    },
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    itemColumn: {
        flex: 1,
        marginRight: 10,
    },
    itemText: {
        fontSize: 16,
        flexWrap: "wrap",
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ff5733",
        textAlign: "right",
    },
    emptyText: {
        fontSize: 16,
        color: "gray",
        textAlign: "center",
        marginTop: 20,
    },
    customerSelect: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    customerSelectText: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    customerItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    customerItemText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#007bff",
        borderRadius: 5,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    paymentMethods: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    paymentButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
        marginHorizontal: 5,
    },
    paymentButtonSelected: {
        backgroundColor: "#28a745",
        borderColor: "#28a745",
    },
    summary: {
        marginTop: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
    },
    totalText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ff5733",
        marginBottom: 10,
    },
    confirmButton: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
    },
    confirmButtonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
    },
});

export default CheckoutScreen;
