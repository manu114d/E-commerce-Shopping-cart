const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const mongoose = require("mongoose");
const { isValidStatus } = require('../validator/validator')

///========================================================= Create Order =========================================================///

const createorder = async (req, res) => {
    try {
        let userId = req.params.userId;
        let { cartId, cancellable, ...rest } = req.body;


        if (Object.keys(req.body).length === 0)
            return res.status(400).send({ status: false, message: "Request body empty... Please provide data for input" })

        if (Object.keys(rest).length != 0)
            return res.status(400).send({
                status: false,
                message: "Extra data provided...Please provide only cartId or cancellable from body",
            });


        if (!mongoose.isValidObjectId(userId))
            return res
                .status(400)
                .send({ status: false, message: "Ivalid userId" });

        if (!cartId)
            return res
                .status(400)
                .send({ status: false, message: "Provide cartId from body" });

        if (!mongoose.isValidObjectId(cartId))
            return res
                .status(400)
                .send({ status: false, message: "Ivalid cartid" });

        if (Object.keys(req.body).includes('cancellable'))
            if (typeof (cancellable) != 'boolean')
                return res
                    .status(400)
                    .send({ status: false, message: "cancellabe must be type boolean" });


        let isUserExist = await userModel.findOne({ _id: userId })
        if (!isUserExist)
            return res.status(404).send({ status: false, message: "user not found" });


        let cartData = await cartModel.findOne({ _id: cartId }).select({ _id: 0 })
        if (!cartData)
            return res.status(404).send({ status: false, message: "cart not found" });

        let usersCart = await cartModel.findOne({ _id: cartId, userId: userId })

        if (req.token.user._id != req.params.userId)
            return res.status(403).send({ status: false, message: "unauthorized" });

        if (!usersCart) {
            return res.status(400).send({ status: false, message: "Cart doesn't belongs to this user" });
        }

        if (!cartData.totalItems)
            return res.status(404).send({ status: false, message: "cart is empty" });



        let cartDataObj = cartData.toObject()

        let totalQuantity = 0;
        cartDataObj.items.map(x => totalQuantity += x.quantity)
        cartDataObj.totalQuantity = totalQuantity

        if (Object.keys(req.body).includes('cancellable'))
            cartDataObj.cancellable = cancellable


        let createdOrder = await orderModel.create(cartDataObj)
        return res.status(201).send({ status: true, message: "Success", data: createdOrder })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}


///========================================================= Update Order =========================================================///

const updateorder = async (req, res) => {
    try {
        let userId = req.params.userId;
        let { orderId, status, cancellable, ...rest } = req.body;

        if (Object.keys(req.body).length === 0)
            return res.status(400).send({ status: false, message: "Request body empty... Please provide data for input" })

        if (Object.keys(rest).length != 0)
            return res.status(400).send({
                status: false,
                message: "Extra data provided...Please provide only orderId and status from body",
            });

        if (!mongoose.isValidObjectId(userId))
            return res
                .status(400)
                .send({ status: false, message: "Ivalid userId" });

        if (!mongoose.isValidObjectId(orderId))
            return res
                .status(400)
                .send({ status: false, message: "Ivalid orderId" });

        if (!isValidStatus(status))
            return res.status(400).send({ status: false, message: "status must be among these pending, completed, cancelled " })

        let isUserExist = await userModel.findOne({ _id: userId })
        if (!isUserExist)
            return res.status(404).send({ status: false, message: "user not found" });

        let cartData = await cartModel.findOne({ userId }).select({ _id: 0 })
        if (!cartData)
            return res.status(404).send({ status: false, message: "cart not found" });

        if (req.token.user._id != req.params.userId)
            return res.status(403).send({ status: false, message: "unauthorized" });


        let isOrderExist = await orderModel.findOne({ _id: orderId, isDeleted: false })

        if (!isOrderExist)
            return res.status(404).send({ status: false, message: "order not found" })
        let usersOrder = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!usersOrder) {
            return res.status(400).send({ status: false, message: "order doesn't belongs to this user" });
        }
        if (usersOrder.status == 'completed') {
            return res.status(400).send({ status: false, message: "order already completed" });
        }
        if (usersOrder.status == 'cancelled') {
            return res.status(400).send({ status: false, message: "order already cancelled" });
        }

        if (status == "cancelled") {
            if (isOrderExist.cancellable == false)
                return res.status(400).send({ status: false, message: "This order can't be cancelled" })
        }

        let updatedorder = await orderModel.findOneAndUpdate(
            { _id: orderId, },
            { $set: { status: status } },
            { new: true }
        )

        if (updatedorder.status == "completed") {
            let cartData = await cartModel.findOneAndUpdate(
                { userId },
                { $set: { items: [], totalPrice: 0, totalItems: 0 } },
                { new: true }
            )
        }

        return res.status(200).send({ status: true, message: "Success", data: updatedorder })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}


module.exports = { createorder, updateorder }

//becrypt,aws,redis