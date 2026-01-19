// store-service.js

const BASE_URL =
  "https://listerrboardecom-asanb9fzg4ghbza2.centralindia-01.azurewebsites.net";

let _cachedStoreId = null;

const StoreService = {
  /* ===============================
     1. GET STORE ID FROM URL
     (with caching + iframe safety)
  =============================== */
  getStoreId: () => {
    // 1) Return cached value if we already have it
    if (_cachedStoreId) {
      console.log("[StoreService] Using cached store id:", _cachedStoreId);
      return _cachedStoreId;
    }

    // 2) Try query param (?store=2)
    const params = new URLSearchParams(window.location.search);
    const idFromQuery = params.get("store");

    console.log("[StoreService] URL search:", window.location.search);
    console.log("[StoreService] Parsed store id:", idFromQuery);

    if (idFromQuery) {
      _cachedStoreId = idFromQuery;
      return idFromQuery;
    }

    // 3) Try parent window (iframe case)
    try {
      if (window.parent && window.parent !== window) {
        const parentParams = new URLSearchParams(
          window.parent.location.search
        );
        const idFromParent = parentParams.get("store");

        console.log("[StoreService] Parent URL search:", window.parent.location.search);
        console.log("[StoreService] Parent store id:", idFromParent);

        if (idFromParent) {
          _cachedStoreId = idFromParent;
          return idFromParent;
        }
      }
    } catch (e) {
      // Cross-origin safety
    }

    // 4) Try localStorage (last resort)
    const stored = localStorage.getItem("active_store_id");
    if (stored) {
      console.log("[StoreService] Using stored store id:", stored);
      _cachedStoreId = stored;
      return stored;
    }

    return null;
  },

  /* ===============================
     2. FETCH STORE DATA (AUTH + API)
  =============================== */
  getStoreData: async () => {
    const storeId = StoreService.getStoreId();

    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwiZXhwIjoxNzY4NzE1Njg4fQ.-QtS1TwI8it2FkjH-KXf6juE4P_wOFCggvbxiAXmY84";

    if (!storeId) {
      throw new Error("Missing store ID in URL (?store=2)");
    }

    // Persist for iframe / reload safety
    localStorage.setItem("active_store_id", storeId);

    console.log(`[StoreService] Loading store ${storeId}`);

    const headers = {
      Authorization: `Bearer ${token}`
    };

    /* ---------- 1. GET ALL STORES ---------- */
    const storeRes = await fetch(`${BASE_URL}/api/v1/stores`, { headers });

    if (!storeRes.ok) {
      throw new Error("Failed to fetch stores");
    }

    const storeJson = await storeRes.json();
    const allStores = Array.isArray(storeJson)
      ? storeJson
      : storeJson.data || storeJson.stores || [];

    const store = allStores.find(s => String(s.id) === String(storeId));

    if (!store) {
      throw new Error(`Store ${storeId} not found`);
    }

    /* ---------- 2. GET ALL CATALOGS ---------- */
    const catalogRes = await fetch(`${BASE_URL}/api/v1/catalogs`, { headers });

    if (!catalogRes.ok) {
      throw new Error("Failed to fetch catalogs");
    }

    const catalogJson = await catalogRes.json();
    const allCatalogs = Array.isArray(catalogJson)
      ? catalogJson
      : catalogJson.data || catalogJson.catalogs || [];

    const catalogs = allCatalogs.filter(
      c => String(c.store_id) === String(storeId)
    );

    /* ---------- 3. GET ALL PRODUCTS ---------- */
    const productRes = await fetch(`${BASE_URL}/api/v1/products`, { headers });

    if (!productRes.ok) {
      throw new Error("Failed to fetch products");
    }

    const productJson = await productRes.json();
    const allProducts = Array.isArray(productJson)
      ? productJson
      : productJson.data || productJson.products || [];

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
