import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrderById } from '../database/database';

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
                kwargs: { fields: ["id", "name", "list_price", "image_medium", "taxes_id", "categ_id", "pos_categ_id", "product_tmpl_id"] }
            }
        }, {
            headers: { "Cookie": `session_id=${session_id}` }
        });

        return response.data.result || [];
    } catch (error) {
        throw new Error("Không thể lấy dữ liệu sản phẩm: " + error.message);
    }
};

const fetchPartners = async () => {
    try {
        const odooUrl = await AsyncStorage.getItem("odooUrl");
        const session_id = await AsyncStorage.getItem("session_id");
        const response = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "res.partner",
                method: "search_read",
                args: [[["customer", "=", true]]],
                kwargs: { fields: ["id", "name", "mobile"] }
            }
        }, {
            headers: { "Cookie": `session_id=${session_id}` }
        });

        return response.data.result || [];
    } catch (error) {
        throw new Error("Không thể lấy dữ liệu khách hàng: " + error.message);
    }
};

const createPosOrder = async (customer, cart, orderId, paymentMethod) => {
    try {
        const pos_branch_id = await AsyncStorage.getItem("pos_branch");
        const pos_config = await AsyncStorage.getItem("pos_config");
        const user_id = await AsyncStorage.getItem("user_id");
        const user_name = await AsyncStorage.getItem("user_name");
        const pos_session = await AsyncStorage.getItem("pos_session");
        const default_pricelist = await AsyncStorage.getItem("default_pricelist");
        const default_saleperson = await AsyncStorage.getItem("default_saleperson");
        const orderData = await getOrderById(orderId);

        // Tạo danh sách `lines` từ `cart`
        const lines = cart.map(item => [
            0, 0, {
                'qty': item.quantity,
                'price_unit': item.list_price,
                'price_subtotal': item.quantity * item.list_price,
                'price_subtotal_incl': item.quantity * item.list_price, // Giả sử thuế 10%
                'discount': 0,
                'product_id': item.id,
                'tax_ids': [[6, false, []]],
                'pack_lot_ids': [],
                'note': '',
                'combo_item_ids': {},
                'pos_branch_id': JSON.parse(pos_branch_id)[0],
                'voucher': {},
                'session_info': {
                    'user': {
                        'id': JSON.parse(user_id),
                        'name': user_name
                    },
                    'pos': {
                        'id': JSON.parse(pos_config).id,
                        'name': JSON.parse(pos_config).name
                    }
                },
                'state': 'Draft',
            }
        ]);

        // Tính tổng tiền hàng
        const amount_total = lines.reduce((sum, line) => sum + line[2].price_subtotal_incl, 0);
        const amount_paid = amount_total;
        const amount_tax = amount_total;

        const order = [
            {
                'data': {
                    'name': 'POS_ORDER_' + orderId,
                    'amount_paid': amount_paid,
                    'amount_total': amount_total,
                    'amount_tax': amount_tax,
                    'amount_return': 0,
                    'lines': lines,
                    'statement_ids': [[0, 0, {
                        'name': orderData.created_at,
                        'statement_id': paymentMethod.statement_id, // 49402
                        'account_id': paymentMethod.default_debit_account_id[0],  // 8466
                        'journal_id': paymentMethod.id,  // 333
                        'amount': amount_paid
                    }]],
                    'pos_session_id': JSON.parse(pos_session),
                    'pricelist_id': JSON.parse(default_pricelist)[0],
                    'partner_id': customer.id, // customer
                    'user_id': JSON.parse(default_saleperson)[0], // sale person
                    'sequence_number': 2,
                    'creation_date': orderData.created_at.replace(" ", "T") + ".863Z",
                    'fiscal_position_id': false,
                    'to_invoice': true,
                    'table_id': false,
                    'floor': false,
                    'floor_id': false,
                    'customer_count': 1,
                    'sale_journal': 316,
                    'lock': false,
                    'add_credit': false,
                    'location_id': 571,
                    'pos_branch_id': JSON.parse(pos_branch_id)[0],
                    'session_info': { 'user': { 'id': JSON.parse(user_id), 'name': user_name }, 'pos': { 'id': JSON.parse(pos_config).id, 'name': JSON.parse(pos_config).name } }, 'currency_id': 23, 'notify_messages': {}, 'rating': '0', 'promotion_ids': []
                }, 'to_invoice': false
            }];
        const odooUrl = await AsyncStorage.getItem("odooUrl");
        const session_id = await AsyncStorage.getItem("session_id");
        const response = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "pos.order",
                method: "create_from_ui",
                args: [order],
                kwargs: {}
            }
        }, {
            headers: { "Cookie": `session_id=${session_id}` }
        });
        return response.data.result || [];
    } catch (error) {
        throw new Error("Không thể tạo đơn hàng: " + error.message);
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
                method: "search_read",
                args: [[["active", "=", true]]],  // Lấy POS đang hoạt động
                kwargs: { fields: ["id", "name", "journal_ids", "pricelist_id", "customer_default_id", "pos_branch_id", "default_seller_id", "available_pricelist_ids"] },
            }
        }, {
            headers: { Cookie: `session_id=${session_id}` },
        });

        if (!posConfigResponse.data.result || posConfigResponse.data.result.length === 0) {
            throw new Error("Không tìm thấy POS Config nào!");
        }

        const config_id = posConfigResponse.data.result[0];
        await AsyncStorage.setItem("pos_config", JSON.stringify(config_id));
        await AsyncStorage.setItem("pos_branch", JSON.stringify(config_id.pos_branch_id));

        // Lấy Payment Method ID
        const paymentMethodResponse = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "account.journal",
                method: "search_read",
                args: [[["id", "in", config_id.journal_ids]]],  // Lấy POS đang hoạt động
                kwargs: { fields: ["id", "name", "default_debit_account_id"] },
            }
        }, {
            headers: { Cookie: `session_id=${session_id}` },
        });

        if (!paymentMethodResponse.data.result) {
            throw new Error("Không tìm thấy account journal nào!");
        }
        const payment_methods = paymentMethodResponse.data.result;

        // Lấy Pricelist ID
        const priceListResponse = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "product.pricelist",
                method: "search_read",
                args: [[["id", "in", config_id.available_pricelist_ids]]],  // Lấy POS đang hoạt động
                kwargs: { fields: ["id", "name"] },
            }
        }, {
            headers: { Cookie: `session_id=${session_id}` },
        });

        if (!priceListResponse.data.result) {
            throw new Error("Không tìm thấy pricelist nào!");
        }
        const pricelists = priceListResponse.data.result;
        await AsyncStorage.setItem("pricelists", JSON.stringify(pricelists));

        // Lấy Default Pricelist ID
        await AsyncStorage.setItem("default_pricelist", JSON.stringify(config_id.pricelist_id));

        // Lấy Default saleperson ID
        await AsyncStorage.setItem("default_saleperson", JSON.stringify(config_id.default_seller_id));

        // Lấy Default Customer ID
        await AsyncStorage.setItem("default_customer", JSON.stringify(config_id.customer_default_id));

        // Kiểm tra xem POS session đã tồn tại chưa
        let pos_session_id = null;
        const sessionCheckResponse = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "pos.session",
                method: "search",
                args: [[["state", "=", "opened"], ["config_id", "=", config_id.id], ["user_id", "=", parsedUserId]]],
                kwargs: {},
            }
        }, {
            headers: { Cookie: `session_id=${session_id}` },
        });
        if (sessionCheckResponse.data.result.length > 0) {
            pos_session_id = sessionCheckResponse.data.result[0];
            await AsyncStorage.setItem("pos_session", JSON.stringify(sessionCheckResponse.data.result[0]));
            // return { message: "POS session đã tồn tại!", session_id: sessionCheckResponse.data.result[0] };
        }

        // Tạo POS session mới
        if (!pos_session_id) {
            const response = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    model: "pos.session",
                    method: "create",
                    args: [{ user_id: parsedUserId, config_id: config_id.id }],
                    kwargs: {},
                }
            }, {
                headers: { "Cookie": `session_id=${session_id}` }
            });
            if (response.data.result) {
                pos_session_id = response.data.result;
                await AsyncStorage.setItem("pos_session", JSON.stringify(response.data.result));
            }
        }
        // Lấy dữ liệu account bank statement
        if (pos_session_id) {
            const responseABS = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    model: "account.bank.statement",
                    method: "search_read",
                    args: [[["pos_session_id", "=", pos_session_id]]],
                    kwargs: { fields: ["id", "journal_id"] },
                }
            }, {
                headers: { "Cookie": `session_id=${session_id}` }
            });
            if (responseABS.data.result) {
                let newPaymentMethods = payment_methods;
                for (let i = 0; i < responseABS.data.result.length; i++) {
                    newPaymentMethods = newPaymentMethods.map((item) =>
                        item.id === responseABS.data.result[i].journal_id[0] ? { ...item, statement_id: responseABS.data.result[i].id } : item
                    );
                }
                await AsyncStorage.setItem("payment_methods", JSON.stringify(newPaymentMethods));
            }
        }
        return [];
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

const getPricelistItems = async (pricelist_id) => {
    try {
        const odooUrl = await AsyncStorage.getItem("odooUrl");
        const session_id = await AsyncStorage.getItem("session_id");
        const response = await axios.post(`${odooUrl}/web/dataset/call_kw`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "product.pricelist.item",
                method: "search_read",
                args: [[["pricelist_id", "=", pricelist_id.id]]],
                kwargs: { fields: ["id", "name", "min_quantity", "date_start", "date_end", "applied_on", "compute_price", "fixed_price", "percent_price", "categ_id", "product_tmpl_id", "product_id"] }
            }
        }, {
            headers: { "Cookie": `session_id=${session_id}` }
        });

        return response.data.result || [];
    } catch (error) {
        throw new Error("Không thể lấy dữ liệu pricelistItems: " + error.message);
    }
};

export { loginOdoo, fetchProducts, fetchPosConfigs, fetchPriceLists, createSessionResponse, createPosOrder, fetchPartners, getPricelistItems };
