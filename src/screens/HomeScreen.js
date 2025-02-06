import React, { useState } from 'react';
import { View, FlatList, TextInput, Text, StyleSheet } from 'react-native';
import ProductItem from '../components/ProductItem';

const productList = [
    { id: '1', name: 'Dưa lê hồng kim', price: 100000, image: 'https://via.placeholder.com/100' },
    { id: '2', name: 'Dưa lê bạch kim', price: 200000, image: 'https://via.placeholder.com/100' },
    { id: '3', name: 'Dưa lưới ngọc bích', price: 150000, image: 'https://via.placeholder.com/100' },
    { id: '4', name: 'Dưa lưới hằng nga', price: 300000, image: 'https://via.placeholder.com/100' },
];

const HomeScreen = ({ cart, setCart }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const addToCart = (item) => {
        const itemExists = cart.find((p) => p.id === item.id);
        if (itemExists) {
            setCart(cart.map((p) =>
                p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    // Lọc sản phẩm theo tên
    const filteredProducts = productList.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Ô tìm kiếm */}
            <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {/* Hiển thị danh sách sản phẩm */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => (
                    <ProductItem item={item} onPress={() => addToCart(item)} />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 10,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
});

export default HomeScreen;
