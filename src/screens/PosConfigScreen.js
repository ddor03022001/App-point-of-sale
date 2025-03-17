import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { createSessionResponse, fetchProducts, getpromotions } from '../api/odooApi';

const PosConfigScreen = ({ posConfigIds, setproducts, setPromotions }) => {
    const [loading, setLoading] = useState(false);
    const [loadingPos, setLoadingPos] = useState(null);

    const navigation = useNavigation();

    const posCreateSession = async (posId) => {
        setLoading(true);
        setLoadingPos(posId.id);
        try {
            const filteredPos = posConfigIds.filter(pos =>
                pos.status === 'active'
            )
            if (filteredPos.length > 0) {
                Alert.alert("Thông báo", "Chỉ được mở 1 ca bán hàng tại 1 thời điểm");
            } else {
                await createSessionResponse(posId);
                const products = await fetchProducts();
                setproducts(products);
                const promotions = await getpromotions();
                setPromotions(promotions);
                navigation.navigate("Main");
            }
        } catch (error) {
            Alert.alert("Mở session thất bại", error.message);
        } finally {
            setLoadingPos(null);
            setLoading(false);
        }
    };

    const posContinueSession = async (posId) => {
        setLoading(true);
        setLoadingPos(posId.id);
        try {
            await createSessionResponse(posId);
            const products = await fetchProducts();
            setproducts(products);
            const promotions = await getpromotions();
            setPromotions(promotions);
            navigation.navigate("Main");
        } catch (error) {
            Alert.alert("Mở session thất bại", error.message);
        } finally {
            setLoadingPos(null);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {posConfigIds.length === 0 ? (
                <Text style={styles.emptyText}>Không có pos nào 😢</Text>
            ) : (
                <FlatList
                    data={posConfigIds}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <View style={styles.cartInfo}>
                                <Text style={styles.cartName}>{item.name}</Text>
                                <View style={styles.quantityContainer}>
                                    {item.status === 'open' ? (
                                        loading && loadingPos == item.id ? (
                                            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
                                        ) : (
                                            <Button
                                                textColor='green'
                                                onPress={() => posCreateSession(item)
                                                }
                                            > Mở ca</Button>
                                        )

                                    ) : (
                                        loading && loadingPos == item.id ? (
                                            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
                                        ) : (
                                            <Button
                                                textColor='green'
                                                onPress={() => posContinueSession(item)}
                                            >Tiếp tục bán</Button>
                                        )
                                    )}
                                </View>
                            </View>
                        </View>
                    )
                    }
                />
            )}
        </View >
    );
};

export default PosConfigScreen;

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
    cartInfo: {
        flex: 1,
    },
    cartName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
