import { getPricelistItems } from '../api/odooApi';
import moment from 'moment';

const getValuePricelist = async (pricelist_id, product_id, quantity) => {
    try {
        if (!quantity) {
            quantity = 1
        }
        if (!pricelist_id) {
            return product_id.list_price;
        }
        const pricelist_items = await getPricelistItems(pricelist_id);
        if (pricelist_items == undefined || pricelist_items.length == 0) {
            return product_id.list_price;
        }
        var date = moment().startOf('day');
        var category_ids = [];
        var category = product_id.categ_id;
        while (category) {
            category_ids.push(category.id);
            category = category.parent;
        }
        var pricelist_items_check = [];
        for (var i = 0; i < pricelist_items.length; i++) {
            var item = pricelist_items[i];
            if ((!item.product_tmpl_id || item.product_tmpl_id[0] === product_id.product_tmpl_id[0]) &&
                (!item.product_id || item.product_id[0] === product_id.id) &&
                (!item.categ_id || _.contains(category_ids, item.categ_id[0])) &&
                (!item.date_start || moment(item.date_start).isSameOrBefore(date)) &&
                (!item.date_end || moment(item.date_end).isSameOrAfter(date))) {
                pricelist_items_check.push(item)
            }
        }
        var price = product_id.list_price;
        for (var i = 0; i < pricelist_items_check.length; i++) {
            var rule = pricelist_items_check[i];
            if (rule.min_quantity && quantity < rule.min_quantity) {
                continue;
            }
            if (rule.compute_price === 'fixed') {
                price = rule.fixed_price;
                break;
            } else if (rule.compute_price === 'percentage') {
                price = price - (price * (rule.percent_price / 100));
                break;
            }
        }
        return price;
    } catch (error) {
        throw new Error("Lỗi kết nối Odoo: " + error.message);
    }
};

export { getValuePricelist };