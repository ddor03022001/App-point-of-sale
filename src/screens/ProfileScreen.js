import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearOrders } from '../database/database';

const ProfileScreen = ({ setIsLoggedIn }) => {
    const [userName, setUserName] = useState('null');
    const [posConfig, setPosConfig] = useState('null');
    const [priceList, setPriceList] = useState('null');

    useEffect(() => {
        const getSetting = async () => {
            try {
                const storedSessionId = await AsyncStorage.getItem('user_name');
                const posConfigId = await AsyncStorage.getItem('pos_config');
                const pricelist_id = await AsyncStorage.getItem('default_pricelist');
                if (storedSessionId !== null) {
                    setUserName(storedSessionId);
                }
                if (posConfigId !== null) {
                    setPosConfig(JSON.parse(posConfigId).name);
                }
                if (pricelist_id !== null) {
                    setPriceList(JSON.parse(pricelist_id)[1]);
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu setting:', error);
            }
        };

        getSetting();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Lỗi khi xóa session_id:', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profileContainer}>
                <Text style={styles.title}>👤 Thông tin tài khoản</Text>
                <Text style={styles.sessionText}>{userName}</Text>
                <Text style={styles.sessionText}>{posConfig}</Text>
                <Text style={styles.sessionText}>{priceList}</Text>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Đăng xuất</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={clearOrders}>
                    <Text style={styles.buttonText}>Xóa toàn bộ đơn hàng</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    sessionText: {
        fontSize: 18,
        color: 'gray',
        marginTop: 10,
    },
    actionsContainer: {
        marginTop: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});
