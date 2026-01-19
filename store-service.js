// store-service.js

const BASE_URL =
  "https://listerrboardecom-asanb9fzg4ghbza2.centralindia-01.azurewebsites.net";

const StoreService = {
  /* ===============================
     1. GET STORE ID FROM URL
  =============================== */
  getStoreId: () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("store");
    return id;
  },

  /* ===============================
     2. FETCH STORE DATA (AUTH + API)
  =============================== */
  getStoreData: async () => {
    const storeId = StoreService.getStoreId();

    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwiZXhwIjoxNzY4NzE1Njg4fQ.-QtS1TwI8it2FkjH-KXf6juE4P_wOFCggvbxiAXmY84";

    if (!storeId) {
      throw new Error("Missing store ID in URL (?store=1)");
    }

    if (!token) {
      throw new Error("User not authenticated");
    }

    console.log(`[StoreService] Loading store ${storeId}`);

    const headers = {
      Authorization: `Bearer ${token}`
    };

    /* ---------- 1. GET ALL STORES ---------- */
    const storeRes = await fetch(`${BASE_URL}/api/v1/stores`, {
      headers
    });

    if (!storeRes.ok) {
      throw new Error("Failed to fetch stores");
    }

    const stores = await storeRes.json();
    const store = stores.find(s => String(s.id) === String(storeId));

    if (!store) {
      throw new Error("Store not found");
    }

    /* ---------- 2. GET ALL CATALOGS ---------- */
    const catalogRes = await fetch(`${BASE_URL}/api/v1/catalogs`, {
      headers
    });

    if (!catalogRes.ok) {
      throw new Error("Failed to fetch catalogs");
    }

    const allCatalogs = await catalogRes.json();

    const catalogs = allCatalogs.filter(
      c => String(c.store_id) === String(storeId)
    );

    /* ---------- 3. GET ALL PRODUCTS ---------- */
    const productRes = await fetch(`${BASE_URL}/api/v1/products`, {
      headers
    });

    if (!productRes.ok) {
      throw new Error("Failed to fetch products");
    }

    const allProducts = await productRes.json();

    /* ---------- 4. GROUP PRODUCTS BY CATALOG ---------- */
    const categories = catalogs.map(cat => {
      const products = allProducts.filter(
        p => String(p.catalog_id) === String(cat.id)
      );

      return {
        id: cat.id,
        name: cat.name,
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          mrp: p.mrp,
          unit: p.unit,
          image: p.image_url || "",
          discount: p.discount || null,
          stock: p.stock
        }))
      };
    });

    /* ---------- 5. NORMALIZED STORE OBJECT ---------- */
    return {
      id: store.id,
      name: store.name,
      address: store.address,
      categories
    };
  },

  /* ===============================
     3. CART (STORE ISOLATED)
  =============================== */
  getCartKey: () => `cart_${StoreService.getStoreId()}`,

  getCart: () => {
    return JSON.parse(localStorage.getItem(StoreService.getCartKey())) || {};
  },

  saveCart: (cart) => {
    localStorage.setItem(
      StoreService.getCartKey(),
      JSON.stringify(cart)
    );
  }
};

window.StoreService = StoreService;
