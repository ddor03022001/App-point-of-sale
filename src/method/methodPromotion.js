import moment from 'moment';
import { getItempromotion1s, getItempromotion14s, getItempromotion15s } from '../api/odooApi';

const PromotionActive = async (promotions) => {
    var promotionActives = [];
    var date = moment();
    for (var i = 0; i < promotions.length; i++) {
        var item = promotions[i];
        if (item.type == 'none' ||
            (moment(item.start_date, 'YYYY-MM-DD HH:mm:ss').isSameOrBefore(date) &&
                moment(item.end_date, 'YYYY-MM-DD HH:mm:ss').isSameOrAfter(date))) {
            promotionActives.push(item);
        }
    }
    return promotionActives
};

const addPromotionIncart = async (setCart, promotion, total_order, products, cart, setPromotionIds) => {
    try {
        var newPromotionIds = [];
        await removePromotion(cart, setCart);
        setPromotionIds([]);
        if (promotion.type == "1_discount_total_order") {
            const check = await promotion_1(setCart, promotion, total_order, products, cart);
            if (check) {
                newPromotionIds.push(promotion.id);
            }
        } else if (promotion.type == "14_buy_the_total_bill_and_get_a_gift") {
            const check = await promotion_14(setCart, promotion, total_order, products, cart);
            if (check) {
                newPromotionIds.push(promotion.id);
            }
        } else if (promotion.type == "15_cash_discount_total_order") {
            const check = await promotion_15(setCart, promotion, total_order, products, cart);
            if (check) {
                newPromotionIds.push(promotion.id);
            }
        }
        setPromotionIds(newPromotionIds);
    } catch (error) {
        throw new Error("Lỗi kết nối Odoo: " + error.message);
    }
};

const promotion_1 = async (setCart, promotion, total_order, products, cart) => {
    try {
        const items = await getItempromotion1s(promotion.discount_order_ids);
        var discount_line_tmp = null;
        var discount_tmp = 0;
        if (items) {
            var i = 0;
            while (i < items.length) {
                var discount_line = items[i];
                if (total_order >= discount_line.minimum_amount && total_order >= discount_tmp) {
                    discount_line_tmp = discount_line;
                    discount_tmp = discount_line.minimum_amount;
                }
                i++;
            }
        }
        if (!discount_line_tmp) {
            return false;
        }
        if (discount_line_tmp && total_order > 0) {
            var product = products.filter((item) => item.id == promotion.product_id[0])[0];
            var price = -total_order / 100 * discount_line_tmp.discount
            if (product && price != 0) {
                var options = {};
                options.promotion_id = promotion.id;
                options.promotion = true;
                options.promotion_reason = 'Discount ' + discount_line_tmp.discount + ' % ' + ' because total order bigger or equal ' + discount_line_tmp.minimum_amount;
                await addPromotionLine(setCart, product, price, 1, options, cart);
            }
        }
        return true;
    } catch (error) {
        throw new Error("Lỗi kết nối Odoo: " + error.message);
    }
}

const promotion_14 = async (setCart, promotion, total_order, products, cart) => {
    try {
        const items = await getItempromotion14s(promotion.buy_the_total_bill_and_get_a_gift_ids);
        var discount_line_tmp = null;
        var discount_tmp = 0;
        if (items) {
            var i = 0;
            while (i < items.length) {
                var discount_line = items[i];
                if (total_order >= discount_line.total_bill && total_order >= discount_tmp) {
                    discount_line_tmp = discount_line;
                    discount_tmp = discount_line.total_bill;
                }
                i++;
            }
        }
        if (!discount_line_tmp) {
            return false;
        }
        if (discount_line_tmp && total_order > 0) {
            var product = products.filter((item) => item.id == discount_line_tmp.product_id[0])[0];
            if (product && price != 0) {
                var options = {};
                options.promotion_id = promotion.id;
                options.promotion = true;
                options.promotion_reason = promotion.name;
                await addPromotionLine(setCart, product, 0, 1, options, cart);
            }
        }
        return true;
    } catch (error) {
        throw new Error("Lỗi kết nối Odoo: " + error.message);
    }
}

const promotion_15 = async (setCart, promotion, total_order, products, cart) => {
    try {
        const items = await getItempromotion15s(promotion.cash_discount_total_order);
        var discount_line_tmp = null;
        var discount_tmp = 0;
        if (items) {
            var i = 0;
            while (i < items.length) {
                var discount_line = items[i];
                if (total_order >= discount_line.minimum_amount && total_order >= discount_tmp) {
                    discount_line_tmp = discount_line;
                    discount_tmp = discount_line.minimum_amount;
                }
                i++;
            }
        }
        if (!discount_line_tmp) {
            return false;
        }
        if (discount_line_tmp && total_order > 0) {
            var product = products.filter((item) => item.id == promotion.product_id[0])[0];
            var price = -discount_line_tmp.discount
            if (product && price != 0) {
                var options = {};
                options.promotion_id = promotion.id;
                options.promotion = true;
                options.promotion_reason = 'Discount ' + discount_line_tmp.discount + ' VNĐ ' + ' because total order bigger or equal ' + discount_line_tmp.minimum_amount;
                await addPromotionLine(setCart, product, price, 1, options, cart);
            }
        }
        return true;
    } catch (error) {
        throw new Error("Lỗi kết nối Odoo: " + error.message);
    }
}

const addPromotionLine = async (setCart, product, price, quantity, option, cart) => {
    setCart([...cart, {
        ...product, quantity: quantity, list_price: price, promotion: option.promotion,
        promotion_id: option.promotion_id, promotion_reason: option.promotion_reason
    }]);
};


const removePromotion = async (cart, setCart) => {
    const newCart = cart.filter((item) => !item.promotion);
    setCart(newCart);
};

export { PromotionActive, addPromotionIncart };