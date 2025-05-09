import React, { useState } from 'react';
import { View, FlatList, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import ProductItem from '../components/ProductItem';


const HomeScreen = ({ cart, setCart, products }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const addToCart = (item) => {
        const itemExists = cart.find((p) => p.id === item.id);
        if (!itemExists) {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    // Lọc sản phẩm theo tên
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6);

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
                    <ProductItem item={item} onPress={() => addToCart(item)} cart={cart} />
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
