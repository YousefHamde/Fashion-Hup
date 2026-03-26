import React from "react";

function CartProduct({ product, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center gap-4 p-4">
      {/* صورة المنتج */}
      <img
        src={product.thumbnail || "https://via.placeholder.com/80"}
        alt={product.title}
        className="w-20 h-20 object-cover rounded"
      />

      {/* تفاصيل المنتج */}
      <div className="flex-1 p-0">
        <h3 className="font-medium">{product.title}</h3>
        {/* <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p> */}
        {/* <p className="text-sm text-gray-400">Qty: {product.quantity}</p> */}
      </div>

      {/* أزرار التحكم */}
      <div className="flex items-center gap-2">
        <button
        //   onClick={onDecrease}
          className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
        >
          −
        </button>
        <span className="min-w-[24px] text-center">{product.quantity}</span>
        <button
        //   onClick={onIncrease}
          className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* زر الحذف */}
      <button
        // onClick={onRemove}
        className="ml-4 text-red-600 hover:text-red-800"
      >
        ✕
      </button>
    </div>
  );
}

// 🟢 استخدام React.memo عشان يقلل الـ re-renders
export default React.memo(CartProduct);
