const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      multipleOf: 0.01,
      required: true,
    },
    currencyId: {
      type: String,
      required: true,
      trim: true,
    },
    currencyFormat: {
      type: String,
      required: true,
      trim: true,
    },
    isFreeShipping: {
      type: Boolean,
      default: false,
      trim: true,
    },
    productImage: {
      type: String,
      required: true,
      trim: true,
    },
    style: {
      type: String,
      trim: true,
    },
    availableSizes: {
      type: [{ type: String }],
      enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
      required: true,
    },

    installments: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

//     title: {string, mandatory, unique},
//   description: {string, mandatory},
//   price: {number, mandatory, valid number/decimal},
//   currencyId: {string, mandatory, INR},
//   currencyFormat: {string, mandatory, Rupee symbol},
//   isFreeShipping: {boolean, default: false},
//   productImage: {string, mandatory},  // s3 link
//   style: {string},
//   availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]},
//   installments: {number},
//   deletedAt: {Date, when the document is deleted},
//   isDeleted: {boolean, default: false},
//   createdAt: {timestamp},
//   updatedAt: {timestamp},
