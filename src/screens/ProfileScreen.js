import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ setIsLoggedIn }) => {
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const getUserName = async () => {
            try {
                const storedSessionId = await AsyncStorage.getItem('user_name');
                if (storedSessionId !== null) {
                    setUserName(storedSessionId);
                } else {
                    setUserName('Chưa đăng nhập');
                }
            } catch (error) {
                console.error('Lỗi khi lấy session_id:', error);
            }
        };

        getUserName();
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
        <View style={styles.container}>
            <Text style={styles.title}>👤 Thông tin tài khoản</Text>
            <Text style={styles.sessionText}>{userName}</Text>
            <Button title="Đăng xuất" onPress={handleLogout} color="red" />
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    sessionText: {
        fontSize: 16,
        marginBottom: 20,
        color: 'gray',
    },
});
