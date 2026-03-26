import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const ProductContext = createContext();
const BASE_URL = "https://dummyjson.com";

const initialState = {
  products: [],
  carts: [],
  wishList: [],
  isLoading: false,
  currentProduct: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true, error: "" };

    case "products/loaded":
      return { ...state, isLoading: false, products: action.payload.products };

    case "product/loaded":
      return { ...state, isLoading: false, currentProduct: action.payload };

    case "carts/loaded":
      return { ...state, isLoading: false, carts: action.payload.carts || [] };

    case "carts/added": {
      const exists = state.carts.some((cart) =>
        cart.products?.some(
          (product) => product.id === action.payload.products?.[0]?.id
        )
      );
      if (exists) {
        console.warn("⚠️ Product already in cart");
        return { ...state, isLoading: false };
      }

      return {
        ...state,
        isLoading: false,
        carts: [...state.carts, action.payload],
      };
    }

    case "carts/deleted":
      return {
        ...state,
        isLoading: false,
        carts: state.carts
          .map((cart) => ({
            ...cart,
            products: cart.products.filter(
              (product) => product.id !== action.payload
            ),
          }))
          .filter((cart) => cart.products.length > 0),
      };

    case "wish/added":
      if (state.wishList.some((item) => item.id === action.payload.id))
        return { ...state, isLoading: false };
      return {
        ...state,
        isLoading: false,
        wishList: [...state.wishList, action.payload],
      };

    case "wish/deleted":
      return {
        ...state,
        isLoading: false,
        wishList: state.wishList.filter((item) => item.id !== action.payload),
      };

    case "rejected":
      return { ...state, isLoading: false, error: action.payload };

    default:
      return state;
  }
}

export function ProductProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, currentProduct, carts, wishList, isLoading, error } = state;

  // 🛍️ Load all products
  useEffect(() => {
    async function fetchProducts() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/products`);
        const data = await res.json();
        dispatch({ type: "products/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading products",
        });
      }
    }
    fetchProducts();
  }, []);

  // 📦 Get single product
  const getProduct = useCallback(
    async function (id) {
      if (Number(id) === currentProduct.id) return;
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/products/${id}`);
        const data = await res.json();
        dispatch({ type: "product/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading the product",
        });
      }
    },
    [currentProduct.id]
  );

  // 🧺 Get carts for a specific user
  const getUserCartsById = useCallback(async function (userId) {
    if (!userId || userId > 5) {
      console.warn("Invalid userId for dummyjson (use 1–5)");
      return;
    }
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/carts/user/${userId}`);
      const data = await res.json();
      dispatch({ type: "carts/loaded", payload: data });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error loading carts",
      });
    }
  }, []);

  // ➕ Add cart
  const addCart = useCallback(async function (newCart) {
    // dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/carts/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newCart.userId,
          products: newCart.products,
        }),
      });
      const data = await res.json();
      dispatch({ type: "carts/added", payload: data });
      return data;
    } catch {
      dispatch({ type: "rejected", payload: "Failed to add cart" });
    }
  }, []);

  // ❌ Delete product from cart
  const deleteCart = useCallback(async function (productId) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${BASE_URL}/carts/${productId}`, { method: "DELETE" });
      dispatch({ type: "carts/deleted", payload: productId });
    } catch {
      dispatch({ type: "rejected", payload: "Failed to delete from cart" });
    }
  }, []);

  // 💖 Add to wishlist
  const addProductWish = useCallback(async function (id) {
    // dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`);
      const data = await res.json();
      dispatch({ type: "wish/added", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error adding to wishlist",
      });
    }
  }, []);

  // ❌ Remove from wishlist
  const deleteWish = useCallback(function (id) {
    dispatch({ type: "wish/deleted", payload: id });
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        currentProduct,
        carts,
        wishList,
        isLoading,
        error,
        getProduct,
        getUserCartsById,
        addCart,
        deleteCart,
        addProductWish,
        deleteWish,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context)
    throw new Error("useProduct must be used within a ProductProvider");
  return context;
}
