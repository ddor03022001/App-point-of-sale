import * as SQLite from 'expo-sqlite/next';

let db; // Biến database toàn cục

export const setupDatabase = async () => {
    db = await SQLite.openDatabaseAsync('shop.db'); // Mở database

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_price REAL,
            payment_method TEXT,
            created_at TEXT
        );
    `);

    console.log("✅ Database đã sẵn sàng!");
};

// ✅ Hàm tạo đơn hàng mới
export const createOrder = async (totalPrice, paymentMethod) => {
    if (!db) {
        console.log("❌ Database chưa sẵn sàng!");
        return null;
    }

    const result = await db.runAsync(
        `INSERT INTO orders (total_price, payment_method, created_at) VALUES (?, ?, datetime('now'));`,
        [totalPrice, paymentMethod]
    );

    console.log("✅ Đơn hàng đã được lưu:", result.lastInsertRowId);
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

export const clearOrders = async () => {
    if (!db) {
        console.log("❌ Database chưa sẵn sàng!");
        return;
    }

    try {
        await db.runAsync("DELETE FROM orders;");
        console.log("✅ Đã xóa toàn bộ đơn hàng trong database.");
    } catch (error) {
        console.error("❌ Lỗi khi xóa đơn hàng:", error);
    }
};


export { db };
