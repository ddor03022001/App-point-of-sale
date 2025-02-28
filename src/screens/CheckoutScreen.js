import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { fetchPartners } from '../api/odooApi';
import { createOrder, createOrderLine } from '../database/database';
import { createPosOrder } from '../api/odooApi';
import { getValuePricelist } from "../method/methodPricelist";
import { useNavigation } from '@react-navigation/native';


const CheckoutScreen = ({ defaultCart, defaultSetCart }) => {
    const [cart, setCart] = useState(defaultCart);
    const [customers, setCustomers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerModalVisible, setCustomerModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [loadingCreatePosOrder, setLoadingCreatePosOrder] = useState(false);
    const [priceLists, setPriceLists] = useState([]);
    const [selectedPriceList, setSelectedPriceList] = useState(null);
    const [isPriceListModalVisible, setPriceListModalVisible] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const data = await fetchPartners();
                setCustomers(data);
                setSelectedCustomer(data[0]);
                const payment_methods = await AsyncStorage.getItem('payment_methods');
                setPaymentMethods(JSON.parse(payment_methods));
                setPaymentMethod(JSON.parse(payment_methods)[0]);
                const pricelists = await AsyncStorage.getItem('pricelists');
                setPriceLists(JSON.parse(pricelists));
                const default_customer = await AsyncStorage.getItem('default_customer');
                const data_customer = {
                    id: JSON.parse(default_customer)[0],
                    name: JSON.parse(default_customer)[1],
                    mobile: null,
                }
                setSelectedCustomer(data_customer);
                const default_pricelist = await AsyncStorage.getItem('default_pricelist');
                const data_pricelist = {
                    id: JSON.parse(default_pricelist)[0],
                    name: JSON.parse(default_pricelist)[1],
                }
                setSelectedPriceList(data_pricelist);
                setValuePricelist(data_pricelist);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadCustomers();
    }, []);

    const setValuePricelist = async (pricelist) => {
        try {
            const new_cart = defaultCart.map(async (item) => {
                const updatedItem = { ...item };
                updatedItem.list_price = await getValuePricelist(pricelist, item, item.quantity);
                return updatedItem;
            });

            const updatedCart = await Promise.all(new_cart);
            setCart(updatedCart);
        } catch (error) {
            alert("Đã xảy ra lỗi khi set pricelist!");
        }
    };

    const totalAmount = cart.reduce((total, item) => total + item.list_price * item.quantity, 0).toLocaleString();

    // Hàm thanh toán
    const handleConfirmOrder = async () => {
        setLoadingCreatePosOrder(true);
        try {
            const selectedSaleperson = await AsyncStorage.getItem('default_saleperson');
            const pricelist = await AsyncStorage.getItem('default_pricelist');
            const order_id = await createOrder(totalAmount, paymentMethod, selectedCustomer, JSON.parse(selectedSaleperson), JSON.parse(pricelist));
            for (const item of cart) {
                await createOrderLine(order_id, item);
            }
            await createPosOrder(selectedCustomer, cart, order_id, paymentMethod);
            alert(`Đơn hàng được tạo thành công`);
            defaultSetCart([]);
            navigation.goBack(); // ✅ Quay lại màn hình trước
        } catch (error) {
            alert("Đã xảy ra lỗi khi xử lý đơn hàng!");
        } finally {
            setLoadingCreatePosOrder(false); // Kết thúc loading sau khi xử lý xong
        }
    };

    // const handleConfirmOrder = () => {
    //     alert(`Đơn hàng đã được xác nhận!\nKhách hàng: ${selectedCustomer.name}\nPhương thức thanh toán: ${paymentMethod}`);
    //     defaultSetCart([]);
    //     navigation.goBack();
    // };

    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchText.toLowerCase()) || String(customer.mobile || "").includes(searchText)
    ).slice(0, 5);

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <ScrollView>
            <View style={styles.container}>
                {/* Danh sách sản phẩm */}
                {cart.length > 0 ? (
                    cart.map((item) => (
                        <View key={item.id} style={styles.item}>
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
                    ))

                ) : (
                    <Text style={styles.emptyText}>Giỏ hàng trống</Text>
                )}

                {/* Chọn Bảng giá */}
                <Text style={styles.sectionTitle}>Bảng giá</Text>
                <TouchableOpacity style={styles.customerSelect} onPress={() => setPriceListModalVisible(true)}>
                    <Text style={styles.customerSelectText}>
                        {selectedPriceList.name}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="black" />
                </TouchableOpacity>

                {/* Modal chọn Bảng giá */}
                <Modal visible={isPriceListModalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chọn Bảng giá</Text>
                            <FlatList
                                data={priceLists}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.customerItem}
                                        onPress={() => {
                                            setValuePricelist(item);
                                            setSelectedPriceList(item);
                                            setPriceListModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.customerItemText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setPriceListModalVisible(false)}>
                                <Text style={styles.closeButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Chọn khách hàng */}
                <Text style={styles.sectionTitle}>Khách hàng</Text>
                <TouchableOpacity style={styles.customerSelect} onPress={() => setCustomerModalVisible(true)}>
                    <Text style={styles.customerSelectText}>
                        {selectedCustomer.mobile ? (
                            selectedCustomer.name + " - " + selectedCustomer.mobile
                        ) : (
                            selectedCustomer.name
                        )}
                    </Text>
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
                                        <Text style={styles.customerItemText}>{item.name + " - " + item.mobile}</Text>
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
                        data={paymentMethods} // Bạn có thể thêm phương thức thanh toán tùy thích
                        keyExtractor={(item) => item.id}
                        horizontal={true} // Cuộn ngang
                        showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.paymentButton,
                                    paymentMethod.id === item.id && styles.paymentButtonSelected,
                                ]}
                                onPress={() => setPaymentMethod(item)}
                            >
                                <Text>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Tổng tiền + Nút xác nhận */}
                <View style={styles.summary}>
                    <Text style={styles.totalText}>Tổng tiền: {totalAmount} VND</Text>
                    {/* Hiển thị ActivityIndicator khi loading là true */}
                    {loadingCreatePosOrder ? (
                        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
                    ) : (
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
                            <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
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
