import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchProducts } from '../api/odooApi';

const CheckoutScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Check out</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    productItem: { padding: 10, borderBottomWidth: 1 },
    productName: { fontSize: 18, fontWeight: "bold" },
});

export default CheckoutScreen;
