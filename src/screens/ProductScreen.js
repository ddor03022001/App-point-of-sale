import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchProducts } from '../api/odooApi';

const ProductScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <View style={styles.container}>
            <FlatList
                data={products.slice(0, 6)}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.productItem}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text>Giá: {item.list_price} VND</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    productItem: { padding: 10, borderBottomWidth: 1 },
    productName: { fontSize: 18, fontWeight: "bold" },
});

export default ProductScreen;
