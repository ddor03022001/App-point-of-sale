import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ProductItem = ({ item, onPress, cart }) => {
    // Kiểm tra xem sản phẩm có trong giỏ hàng không
    const isInCart = cart.some(cartItem => cartItem.id === item.id); // Giả sử `id` là thuộc tính duy nhất của sản phẩm

    return (
        <TouchableOpacity style={[styles.productCard, isInCart && styles.productInCart]} onPress={onPress} activeOpacity={0.7}>
            <Image source={{ uri: `data:image/png;base64,${item.image_medium}` }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.list_price.toLocaleString()}đ</Text>

            {/* Nếu sản phẩm có trong giỏ hàng, hiển thị số lượng */}
            {isInCart && (
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>
                        {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                    </Text>
                </View>
            )}
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
    productInCart: {
        backgroundColor: '#4CAF50',  // Màu xanh khi sản phẩm có trong giỏ hàng
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
    quantityContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#ff5733',
        borderRadius: 50,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    quantityText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
});
