import * as SQLite from 'expo-sqlite/next';

let db; // Biến database toàn cục

export const setupDatabase = async () => {
    db = await SQLite.openDatabaseAsync('posMobile.db'); // Mở database

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            amount_total REAL,
            amount_tax REAL,
            pricelist_id INTEGER,
            pricelist_name TEXT,
            customer_id INTEGER,
            customer_name TEXT,
            saleperson_id INTEGER,
            saleperson_name TEXT,
            payment_method_id INTEGER,
            payment_method_name TEXT,
            pos_session_id INTEGER,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS orderLines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            tax_id INTEGER,
            price REAL,
            quantity REAL,
            created_at TEXT
        );
    `);

    console.log("✅ Database đã sẵn sàng!");
};

// ✅ Hàm tạo order mới
export const createOrder = async (amount_total, paymentMethod, customer, salePerson, pricelist, name_order, pos_session_id) => {
    if (!db) {
        console.log("❌ Database chưa sẵn sàng!");
        return null;
    }

    const result = await db.runAsync(
        `INSERT INTO orders (name, amount_total, pricelist_id, pricelist_name, customer_id, customer_name, saleperson_id, saleperson_name, payment_method_id, payment_method_name, pos_session_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));`,
        [name_order, amount_total, pricelist[0], pricelist[1], customer.id, customer.name,
            salePerson[0], salePerson[1], paymentMethod.id, paymentMethod.name, pos_session_id]
    );

    console.log("✅ Order đã được lưu:", result.lastInsertRowId);
    return result.lastInsertRowId;
};

// ✅ Hàm tạo orderLine mới
export const createOrderLine = async (order_id, product) => {
    if (!db) {
        console.log("❌ Database chưa sẵn sàng!");
        return null;
    }

    tax_id = null;
    if (product.taxes_id && product.taxes_id.length > 0) {
        tax_id = product.taxes_id[0].amount;
    }

    const result = await db.runAsync(
        `INSERT INTO orderLines (order_id, product_id, product_name, tax_id, price, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'));`,
        [order_id, product.id, product.name, tax_id, product.list_price * product.quantity, product.quantity]
    );

    console.log("✅ OrderLines đã được lưu:", result.lastInsertRowId);
    return result.lastInsertRowId;
};

// ✅ Hàm lấy danh sách đơn hàng
export const getOrders = async () => {
    if (!db) {
        console.log("❌ Database chưa sẵn sàng!");
        return [];
    }

    return await db.getAllAsync(`SELECT * FROM orders ORDER BY created_at DESC;`);
};

export const getOrderById = async (orderId) => {
    if (!db) {
        console.log("❌ Database chưa sẵn sàng!");
        return [];
    }

    return await db.getFirstAsync(`SELECT * FROM orders WHERE id = ?`, [orderId]);
};

export const getOrderLinesByOrderId = async (orderId) => {
    if (!db) {
        console.log("❌ Database chưa sẵn sàng!");
        return [];
    }

    return await db.getAllAsync(`SELECT * FROM orderLines WHERE order_id = ?`, [orderId]);
};

export const clearOrders = async () => {
    if (!db) {
        console.log("❌ Database chưa sẵn sàng!");
        return;
    }

    try {
        await db.runAsync("DELETE FROM orders;");
        await db.runAsync("DELETE FROM orderLines;");
        console.log("✅ Đã xóa toàn bộ đơn hàng trong database.");
    } catch (error) {
        console.error("❌ Lỗi khi xóa đơn hàng:", error);
    }
};


export { db };
