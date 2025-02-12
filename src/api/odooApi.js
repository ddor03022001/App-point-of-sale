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
            await AsyncStorage.setItem("user_id", JSON.stringify(response.data.result.user_context.uid));
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

const createSessionResponse = async () => {
    try {
        const odooUrl = await AsyncStorage.getItem("odooUrl");
        const session_id = await AsyncStorage.getItem("session_id");
        const user_id = await AsyncStorage.getItem("user_id");
        const parsedUserId = user_id ? JSON.parse(user_id) : null;

        // Lấy POS Config ID
        const posConfigResponse = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "pos.config",
                method: "search",
                args: [[["is_active", "=", true]]],  // Lấy POS đang hoạt động
                kwargs: {},
            }
        }, {
            headers: { Cookie: `session_id=${session_id}` },
        });

        if (!posConfigResponse.data.result || posConfigResponse.data.result.length === 0) {
            throw new Error("Không tìm thấy POS Config nào!");
        }

        const config_id = posConfigResponse.data.result[0];

        // Kiểm tra xem POS session đã tồn tại chưa
        const sessionCheckResponse = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "pos.session",
                method: "search",
                args: [[["state", "=", "opened"], ["config_id", "=", config_id]]],
                kwargs: {},
            }
        }, {
            headers: { Cookie: `session_id=${session_id}` },
        });

        if (sessionCheckResponse.data.result.length > 0) {
            return { message: "POS session đã tồn tại!", session_id: sessionCheckResponse.data.result[0] };
        }

        // Tạo POS session mới
        const response = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "pos.session",
                method: "create",
                args: [{ user_id: parsedUserId, config_id: config_id }],
                kwargs: {},
            }
        }, {
            headers: { "Cookie": `session_id=${session_id}` }
        });

        return response.data.result || [];
    } catch (error) {
        throw new Error("Không thể tạo session: " + error.message);
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

export { loginOdoo, fetchProducts, fetchPosConfigs, fetchPriceLists, createSessionResponse };
