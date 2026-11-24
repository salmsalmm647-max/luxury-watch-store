// إعدادات Firebase: انسخ apiKey من ملف firebase.js الخاص بمتجر السعادة
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "ضع_API_KEY_العام_هنا",
  authDomain: "vip-store-d75d1.firebaseapp.com",
  projectId: "vip-store-d75d1",
  storageBucket: "vip-store-d75d1.firebasestorage.app",
  messagingSenderId: "87901903351",
  appId: "1:87901903351:web:d8f83e25bf511d859bb6f2"
};

export const configured = !firebaseConfig.apiKey.includes("ضع_");
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// مجموعات منفصلة حتى لا تختلط منتجات وطلبات متجر الساعات بمتجر السعادة
export const C = {
  products: "watch_products",
  categories: "watch_categories",
  orders: "watch_orders",
  visits: "watch_pageViews",
  settings: "watch_settings"
};
