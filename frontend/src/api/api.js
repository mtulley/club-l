const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const api = {
  async fetchProducts() {
    const ENDPOINT_PATH = "/api/products";
    const response = await fetch(BACKEND_URL + ENDPOINT_PATH);

    if (!response.ok) {
      throw new Error("HTTP Error: ", error);
    }

    const products = await response.json();

    if (!Array.isArray(products)) {
      throw new Error("Products response is invalid.");
    }

    return products;
  },
};

export default api;
export { BACKEND_URL };
