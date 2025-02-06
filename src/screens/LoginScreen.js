import React, { useState } from 'react';
import { View, Alert, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import { loginOdoo } from '../api/odooApi';

const LoginScreen = ({ setIsLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true); // Ẩn/hiện mật khẩu
    const [loading, setLoading] = useState(false); // Trạng thái loading

    const handleLogin = async () => {
        setLoading(true); // Bắt đầu loading
        try {
            await loginOdoo(email, password);
            // Alert.alert("Đăng nhập thành công!", `User: ${result.username}`);
            setIsLoggedIn(true); // Chuyển đến màn hình chính
        } catch (error) {
            Alert.alert("Đăng nhập thất bại", "Tài khoản hoặc mật khẩu không chính xác");
        } finally {
            setLoading(false); // Kết thúc loading sau khi xử lý xong
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../images/logo.jpg')} style={styles.logo} />
            <TextInput
                label="Email"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.input}
            />
            <TextInput
                label="Mật khẩu"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
                right={
                    <TextInput.Icon
                        icon={secureText ? "eye-off" : "eye"}
                        onPress={() => setSecureText(!secureText)}
                    />
                }
                style={styles.input}
            />
            {/* Hiển thị ActivityIndicator khi loading là true */}
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : (
                <Button mode="contained" onPress={handleLogin} style={styles.button}>
                    Đăng nhập
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f4f4f4',
    },
    logo: {
        width: 150,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        marginBottom: 15,
    },
    button: {
        width: '100%',
        paddingVertical: 8,
    },
});

export default LoginScreen;
