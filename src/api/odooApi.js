import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loginOdoo = async (email, password) => {
    try {
        const odooUrl = "https://pilot.seateklab.vn";
        const response = await axios.post(`${odooUrl}/web/session/authenticate`, {
            jsonrpc: "2.0",
            params: {
                db: "opensea12pilot",
                login: email,
                password: password
            }
        });

        if (response.data.result) {
            await AsyncStorage.setItem("odooUrl", odooUrl);
            await AsyncStorage.setItem("session_id", response.data.result.session_id);
            await AsyncStorage.setItem("user_name", response.data.result.name);
            return response.data.result;
        } else {
            throw new Error("Đăng nhập thất bại");
        }
    } catch (error) {
        throw new Error("Lỗi kết nối Odoo: " + error.message);
    }
};

const fetchProducts = async () => {
    try {
        const odooUrl = await AsyncStorage.getItem("odooUrl");
        const session_id = await AsyncStorage.getItem("session_id");
        const response = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "product.product",
                method: "search_read",
                args: [[["available_in_pos", "=", true]]],
                kwargs: { fields: ["id", "name", "list_price", "image_medium"] }
            }
        }, {
            headers: { "Cookie": `session_id=${session_id}` }
        });

        return response.data.result || [];
    } catch (error) {
        throw new Error("Không thể lấy dữ liệu sản phẩm: " + error.message);
    }
};

const fetchPosConfigs = async () => {
    try {
        const odooUrl = await AsyncStorage.getItem("odooUrl");
        const session_id = await AsyncStorage.getItem("session_id");
        const response = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "pos.config",
                method: "search_read",
                args: [[]],
                kwargs: { fields: ["id", "name"] }
            }
        }, {
            headers: { "Cookie": `session_id=${session_id}` }
        });

        return response.data.result || [];
    } catch (error) {
        throw new Error("Không thể lấy dữ liệu pos: " + error.message);
    }
};

const fetchPriceLists = async () => {
    try {
        const odooUrl = await AsyncStorage.getItem("odooUrl");
        const session_id = await AsyncStorage.getItem("session_id");
        const response = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "product.pricelist",
                method: "search_read",
                args: [[]],
                kwargs: { fields: ["id", "name", "item_ids"] }
            }
        }, {
            headers: { "Cookie": `session_id=${session_id}` }
        });

        return response.data.result || [];
    } catch (error) {
        throw new Error("Không thể lấy dữ liệu pricelists: " + error.message);
    }
};

export { loginOdoo, fetchProducts, fetchPosConfigs, fetchPriceLists };
