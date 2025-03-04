import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { fetchPosConfigs, createSessionResponse } from '../api/odooApi';

const PosConfigScreen = () => {
    const [posConfigs, setPosConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPos, setLoadingPos] = useState(null);

    const fetchPosConfigList = async () => {
        const posConfigList = await fetchPosConfigs(); // Lấy danh sách pos
        setPosConfigs(posConfigList);
    };

    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            fetchPosConfigList();
        }, [])
    );

    const posCreateSession = async (posId) => {
        setLoading(true);
        setLoadingPos(posId.id);
        try {
            const filteredPos = posConfigs.filter(pos =>
                pos.status === 'active'
            )
            if (filteredPos.length > 0) {
                Alert.alert("Thông báo", "Chỉ được mở 1 ca bán hàng tại 1 thời điểm");
            } else {
                await createSessionResponse(posId);
                navigation.navigate("Main");
            }
        } catch (error) {
            Alert.alert("Đăng nhập thất bại", error.message);
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
            navigation.navigate("Main");
        } catch (error) {
            Alert.alert("Đăng nhập thất bại", error.message);
        } finally {
            setLoadingPos(null);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {posConfigs.length === 0 ? (
                <Text style={styles.emptyText}>Không có pos nào 😢</Text>
            ) : (
                <FlatList
                    data={posConfigs}
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
