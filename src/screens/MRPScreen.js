import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchProductMrps, createPosMrp } from '../api/odooApi';

const MRPScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingConfirm, setLoadingConfirm] = useState(false);
    const [productMrps, setProductMrps] = useState([]);
    const [selectedProductMrp, setSelectedProductMrp] = useState(null);
    const [isProductMrpModalVisible, setProductMrpModalVisible] = useState(false);

    useEffect(() => {
        const loadProductMrps = async () => {
            try {
                const data = await fetchProductMrps();
                setProductMrps(data);
                if (data.length > 0) {
                    setSelectedProductMrp(data[0]);
                    setProducts(data[0].product_mrp_ids.map(item => ({ ...item, quantity: item.quantity || 0 })));
                }
            } catch (error) {
                Alert.alert("Đã xảy ra lỗi", error.message);
            } finally {
                setLoading(false);
            }
        };
        loadProductMrps();
    }, []);

    handleQuantityMrp = () => {
        const newProducts = products.filter(item => item.quantity > 0);
        const totalAmount = newProducts.reduce((total, item) => total + item.quantity * item.percent / 100, 0);
        return totalAmount
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

        setProducts(prevProducts =>
            prevProducts.map(item =>
                item.id === id ? { ...item, quantity: newValue } : item
            )
        );
    };

    const handleConfirm = async () => {
        setLoadingConfirm(true);
        try {
            const newProducts = products.filter(item => item.quantity > 0);
            if (handleQuantityMrp() > 0 && newProducts.length > 0) {
                await createPosMrp(selectedProductMrp.id, handleQuantityMrp().toFixed(3), newProducts);
                Alert.alert("Thành công", 'Đơn chế biến được tạo thành công!');
                const removeProducts = products.map(item => ({ ...item, quantity: 0 }));
                setProducts(removeProducts);
            }
        } catch (error) {
            Alert.alert("Thất bại", error.message);
        } finally {
            setLoadingConfirm(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <ScrollView>
            <View style={styles.container}>
                {/* Chọn Product cần sản xuất */}
                <Text style={styles.sectionTitle}>Sản phẩm cần chế biến</Text>
                <TouchableOpacity style={styles.customerSelect} onPress={() => setProductMrpModalVisible(true)}>
                    <Text style={styles.customerSelectText}>
                        {selectedProductMrp ? selectedProductMrp && selectedProductMrp.name : "Chọn sản phẩm"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="black" />
                </TouchableOpacity>

                {/* Modal chọn Product cần sản xuất */}
                <Modal visible={isProductMrpModalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chọn Sản phẩm cần chế biến</Text>
                            <FlatList
                                data={productMrps}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.customerItem}
                                        onPress={() => {
                                            setSelectedProductMrp(item);
                                            setProducts(item.product_mrp_ids.map(prod => ({ ...prod, quantity: prod.quantity || 0 })));
                                            setProductMrpModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.customerItemText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setProductMrpModalVisible(false)}>
                                <Text style={styles.closeButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Danh sách sản phẩm */}
                {products.length > 0 ? (
                    <View style={styles.listContainer}>
                        {products.map((item) => (
                            <View key={item.id} style={styles.itemRow}>
                                <View style={styles.itemColumnCustom}>
                                    <Text style={styles.itemText}>{item.component[1]}</Text>
                                </View>
                                <View style={styles.itemColumn}>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={item.quantity.toString()}
                                        onChangeText={(text) => handleQuantityChange(item.id, text)}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>Danh sách sản phẩm trống</Text>
                )}

                {/* Tổng kết và xác nhận */}
                <View style={styles.summary}>
                    <Text style={styles.totalText}>Số lượng cần chế biến: {handleQuantityMrp().toLocaleString()}</Text>
                    {loadingConfirm ? (
                        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
                    ) : (
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>Xác nhận</Text>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    listContainer: {
        marginTop: 10,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    itemColumn: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    itemColumnCustom: {
        flex: 1,
        justifyContent: "center",
        alignItems: "left",
    },
    itemText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    input: {
        width: "80%",
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 8,
        borderRadius: 5,
        textAlign: "center",
        fontSize: 16,
        color: "red",
        fontWeight: "bold",
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
    summary: {
        marginTop: 20,
        alignItems: "center",
    },
    totalText: {
        fontSize: 18,
        fontWeight: "bold",
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

export default MRPScreen;
