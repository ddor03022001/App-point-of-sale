import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { loginOdoo } from '../api/odooApi';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const result = await loginOdoo(email, password);
            Alert.alert("Đăng nhập thành công!", `User: ${result.username}`);
            navigation.navigate("ProductScreen");
        } catch (error) {
            Alert.alert("Lỗi", error.message);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Email:</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="Nhập email" />
            <Text>Mật khẩu:</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder="Nhập mật khẩu" secureTextEntry />
            <Button title="Đăng nhập" onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;
