import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import { verifyData } from "../utils/verifyData.js";
import mongoose from "mongoose";
import Order from "../models/order/orderModel.js";
import Inventory from "../models/inventory/inventoryModel.js";

// @ GET /api/order/ : Get all orders
// @ GET /api/order?customerId=<id> : Get all orders by a specific customer
// @ GET /api/order?orderId=<id> : Get a specific order
// @ GET /api/order?customerId=<id>orderId=<id> : Get a specific order by customer
export const getOrders = asyncHandler(async (req, res, next) => {
    const { customerId, orderId } = req.query;

    let orders;
    if (customerId !== undefined || orderId !== undefined) {
        const query = {};
        if (customerId) {
            if (!mongoose.Types.ObjectId.isValid(customerId)) {
                return next(createError("Invalid customer Id", 400));
            }
            query.customerId = customerId;
        }
        if (orderId) {
            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                return next(createError("Invalid order Id", 400));
            }
            query._id = orderId;
        }
        orders = await Order.find(query)
            .populate("customerId", "name email phone address")
            .populate("orderProducts.inventoryId", "productName price category");

        if (!orders || orders.length === 0) {
            return next(createError("No orders found", 404));
        }
    } else if (!req.customers) {
        orders = await Order.find()
            .populate("customerId", "name email phone address")
            .populate("orderProducts.inventoryId", "productName price category");

        if (!orders || orders.length === 0) {
            return next(createError("No orders found", 404));
        }
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
        return next(createError("Access denied", 403));
    }

    res.status(200).json({
        message: `${orders.length} Orders found successfully`,
        success: true,
        statusCode: 200,
        orders,
    });
});

// @ POST /api/order/
export const placeOrder = asyncHandler(async (req, res, next) => {
    const { customerId, orderProducts } = req.body;

    if (!Array.isArray(orderProducts) || orderProducts.length === 0) {
        return next(createError("orderProducts need to be an array with values", 400));
    }

    if (!customerId) {
        return next(createError("All fields are required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return next(createError("Invalid customer Id or Inventory Id", 400));
    }

    let totalCalculatedAmount = 0;
    for (const [index, item] of orderProducts.entries()) {
        if (item.inventoryId === undefined) {
            return next(createError(`Order Product index ${index}: inventoryId must have a value`, 400));
        }

        if (!mongoose.Types.ObjectId.isValid(item.inventoryId)) {
            return next(createError(`Order Product index ${index}: Invalid inventoryId`, 400));
        }

        const parsedQuantity = parseInt(item.quantity);
        if (isNaN(parsedQuantity)) {
            return next(createError(`Order Product index ${index}: Quantity must be a number`, 400));
        }

        item.quantity = parsedQuantity;

        console.log(item.inventoryId);
        const inventoryItem = await Inventory.findById(item.inventoryId);
        if (!inventoryItem) {
            return next(createError(`Order Product index ${index}: Inventory item not found`, 404));
        }

        if (inventoryItem.quantity < item.quantity) {
            return next(createError(`Order Product index ${index}: Insufficient stock for product ${item.inventoryId}`, 400));
        }

        item.price = inventoryItem.productPrice;
        totalCalculatedAmount += (item.price * parsedQuantity);

        item.category = inventoryItem.category;
        item.name = inventoryItem.productName;

        inventoryItem.quantity -= item.quantity;
        await inventoryItem.save();
    }

    const placeOrder = new Order({ customerId, totalAmount: totalCalculatedAmount, orderProducts });
    await placeOrder.save();

    res.status(201).json({
        message: "Order placed successfully",
        success: true,
        statusCode: 201,
        order: placeOrder,
    });
});

// @ PATCH /api/order/:orderId : status update
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(createError("Invalid order Id", 400));
    }

    if (!status) {
        return next(createError("Status is required", 400));
    }

    const validStatus = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    const lowerCaseStatus = status.toString().trim().toLowerCase();

    if (!validStatus.includes(lowerCaseStatus)) {
        return next(createError(`Invalid status: ${status}`, 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return next(createError("Order not found", 404));
    }

    if (lowerCaseStatus === "cancelled") {
        const inventoryUpdates = order.orderProducts.map(async (item) => {
            const inventoryItem = await Inventory.findById(item.inventoryId);
            if (inventoryItem) {
                inventoryItem.quantity += item.quantity;
                return inventoryItem.save();
            }
        });

        await Promise.all(inventoryUpdates);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: lowerCaseStatus },
        { new: true }
    );

    res.status(200).json({
        message: "Order status updated successfully",
        success: true,
        statusCode: 200,
        order: updatedOrder,
    });
});


// @ PATCH : /api/order/cancel/:orderId  : To cancel the order 
export const cancelOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(createError("Invalid order Id", 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return next(createError("Order not found", 404));
    }

    if (order.status === "cancelled") {
        return next(createError("Order is already cancelled", 400));
    }

    if (order.status !== "pending") {
        return next(createError("Order can't be cancel now, its already approved", 400));
    }

    const inventoryUpdates = order.orderProducts.map(async (item) => {
        const inventoryItem = await Inventory.findById(item.inventoryId);
        if (inventoryItem) {
            inventoryItem.quantity += item.quantity;
            return inventoryItem.save();
        }
    });

    await Promise.all(inventoryUpdates);

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
        message: "Order cancelled successfully",
        success: true,
        statusCode: 200,
        order,
    });
});

// @ DELETE /api/order/:orderId
export const deleteOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(createError("Invalid order Id", 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return next(createError("Order not found", 404));
    }

    await Order.deleteOne({ _id: orderId });

    res.status(200).json({
        message: "Order deleted successfully",
        success: true,
        statusCode: 200,
    });
});