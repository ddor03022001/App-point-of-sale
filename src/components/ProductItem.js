import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ProductItem = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.7}>
            <Image source={{ uri: `data:image/png;base64,${item.image_medium}` }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.list_price.toLocaleString()}đ</Text>
        </TouchableOpacity>
    );
};

export default ProductItem;

const styles = StyleSheet.create({
    productCard: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 10,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    productPrice: {
        fontSize: 14,
        color: '#ff5733',
        marginTop: 3,
    },
});
