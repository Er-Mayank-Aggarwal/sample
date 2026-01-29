// store-service.js



// Import AuthToken utility
import AuthToken from './auth-token.js';

const BASE_URL =
  "https://listerrboardecom-asanb9fzg4ghbza2.centralindia-01.azurewebsites.net";
window.BASE_URL = BASE_URL;

let _cachedStoreId = null;

const StoreService = {
  /* ===============================
     1. GET STORE ID FROM URL
     (with caching + iframe safety)
  =============================== */
  getStoreId: () => {
    if (_cachedStoreId) {
      return _cachedStoreId;
    }

    // Try query param (?store=2)
    const params = new URLSearchParams(window.location.search);
    const idFromQuery = params.get("store");

    if (idFromQuery) {
      _cachedStoreId = idFromQuery;
      return idFromQuery;
    }

    // Try parent window (iframe case)
    try {
      if (window.parent && window.parent !== window) {
        const parentParams = new URLSearchParams(
          window.parent.location.search
        );
        const idFromParent = parentParams.get("store");

        if (idFromParent) {
          _cachedStoreId = idFromParent;
          return idFromParent;
        }
      }
    } catch (e) {}

    // Last resort: localStorage
    const stored = localStorage.getItem("active_store_id");
    if (stored) {
      _cachedStoreId = stored;
      return stored;
    }

    return null;
  },

  /* ===============================
     2. FETCH STORE DATA (AUTH + API)
     USES: /api/v1/stores/{id}
  =============================== */
  getStoreData: async () => {
    const storeId = StoreService.getStoreId();

    const token = AuthToken.get();

    if (!storeId) {
      throw new Error("Missing store ID in URL (?store=2)");
    }

    // Persist store id for iframe safety
    localStorage.setItem("active_store_id", storeId);

    console.log(`[StoreService] Loading store ${storeId}`);

    const headers = {
      Authorization: `Bearer ${token}`
    };

    /* ---------- 1. GET STORE WITH CATEGORIES + PRODUCTS ---------- */
    const storeRes = await fetch(
      `${BASE_URL}/api/v1/stores/${storeId}`,
      { headers }
    );

    if (!storeRes.ok) {
      throw new Error("Failed to fetch store data");
    }

    const store = await storeRes.json();

    if (!store || !store.categories) {
      throw new Error("Invalid store payload from API");
    }

    /* ---------- 2. NORMALIZE STORE OBJECT ---------- */
    const categories = store.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      products: (cat.products || []).map(p => ({
id: p.id || p.product_id|| null,

        name: p.name,
        price: p.price,
        mrp: p.mrp,
        unit: p.unit,
        image: p.image || p.image_url || "",
        discount: p.discount || null,
        stock: p.stock || null
      }))
    }));
    // store-service.js - Update the return statement in getStoreData
return {
  id: store.id,
  name: store.name,
  logo: store.logo, // Add this to show the store icon in index.html
  address: store.address,
  video: store.video, 
  poster: store.poster,
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
