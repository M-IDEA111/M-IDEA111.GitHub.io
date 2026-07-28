// === صائد الأخطاء التلقائي المطور لتشخيص الأعطال ===
window.onerror = function(message, source, lineno, colno, error) {
    console.error("رصد خطأ تشغيل:", message, "في السطر:", lineno);
    return false;
};

// مؤقت الطوارئ لإلغاء العمليات المعلقة في حال حجب الخوادم
function timeoutPromise(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
}

// === محمل الطوارئ السحابي لتجاوز حظر روابط جوجل gstatic ===
async function ensureFirebaseScriptsLoaded() {
    if (typeof firebase !== "undefined") return true;
    
    console.warn("gstatic محجوبة أو معطلة. جاري تفعيل محمل الطوارئ السحابي البديل من Cloudflare...");
    const altScripts = [
        "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.8.0/firebase-app-compat.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.8.0/firebase-firestore-compat.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.8.0/firebase-auth-compat.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.8.0/firebase-storage-compat.min.js"
    ];
    
    try {
        for (let src of altScripts) {
            await new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = src;
                script.onload = () => resolve(true);
                script.onerror = () => reject(new Error("فشل تحميل: " + src));
                document.head.appendChild(script);
            });
        }
        return typeof firebase !== "undefined";
    } catch (e) {
        console.error("فشل محمل الطوارئ البديل أيضاً:", e);
        return false;
    }
}

// === إعداد دمج قاعدة بيانات Firebase الخاصة بمشروعك الحقيقي ===
const firebaseConfig = {
    apiKey: "AIzaSyB8tS6mWeYEnIyeDE6XZS6wVPwYtuWaqNo",
    authDomain: "creative-house-store-91352.firebaseapp.com",
    projectId: "creative-house-store-91352",
    storageBucket: "creative-house-store-91352.firebasestorage.app",
    messagingSenderId: "814141283174",
    appId: "1:814141283174:web:0df24092c031f17bebc6a7",
    measurementId: "G-BWRNP9SKBG"
};

let db = null;

let productsDatabase = [];
let cart = [];
let wishlist = [];
let userPhoneNumber = localStorage.getItem("user_phone") || null; 

let authMode = "signin";
let isUserReauthenticated = false;

// متغيرات تتبع حالة قص وتكبير الصورة الشخصية
let activeCropFile = null;
let activeCropScale = 1;

// === طبقة واجهة برمجة التطبيقات المتصلة بـ Firebase ===
const API = {
    async getProducts() {
        if (db) {
            try {
                let snapshot = await db.collection("products").orderBy("id", "asc").get();
                if (!snapshot.empty) {
                    let products = [];
                    snapshot.forEach(doc => {
                        let data = doc.data();
                        let category = data.category || "printing";

                        if (category === "premium" || category === "premium_fashion") {
                            category = "printing";
                        } else if (category === "shoes") {
                            category = "toys";
                        } else if (category === "bags") {
                            category = "colors";
                        } else if (category === "clothes") {
                            category = "books";
                        }

                        products.push({
                            id: data.id || 0,
                            name: data.name || "",
                            description: data.description || "",
                            category: category,
                            originalPrice: data.originalPrice ? Number(data.originalPrice) : 0,
                            price: data.price ? Number(data.price) : 0,
                            discount: data.discount || "",
                            rating: data.rating ? Number(data.rating) : 5,
                            reviewsCount: data.reviewsCount ? Number(data.reviewsCount) : 0,
                            image: data.image || ""
                        });
                    });
                    return products;
                }
            } catch (err) {
                console.error("Error reading products from Firestore:", err);
            }
        }
        return typeof initialProducts !== "undefined" ? initialProducts : [];
    },

    async saveProducts(productsList) {
        if (db) {
            try {
                for (let product of productsList) {
                    await db.collection("products").doc(String(product.id)).set(product, { merge: true });
                }
            } catch (err) {
                console.error("Error updating products on Firestore:", err);
            }
        }
        localStorage.setItem("db_products", JSON.stringify(productsList));
    },

    async saveSingleProduct(product) {
        if (db) {
            try {
                const saveAction = db.collection("products").doc(String(product.id)).set(product, { merge: true });
                await Promise.race([saveAction, timeoutPromise(5000)]);
                return true;
            } catch (err) {
                if (err.message === "Timeout") {
                    showNotification("فشل الاتصال بخوادم قاعدة البيانات لحفظ المنتج! تأكد من جودة اتصالك بالإنترنت.", "error");
                } else {
                    console.error("Error saving single product on Firestore:", err);
                }
            }
        }
        return false;
    },

    async deleteProduct(id) {
        if (db) {
            try {
                const deleteAction = db.collection("products").doc(String(id)).delete();
                await Promise.race([deleteAction, timeoutPromise(5000)]);
                return true;
            } catch (err) {
                if (err.message === "Timeout") {
                    showNotification("تعذر حذف المنتج! تأكد من جودة اتصالك بالإنترنت للاتصال بخادم المتجر.", "error");
                } else {
                    console.error("Error deleting product from Firestore:", err);
                }
            }
        }
        return false;
    },

    async getShippingAddress(email) {
        if (db && email) {
            try {
                let cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                let doc = await db.collection("profiles").doc(cleanEmail).get();
                if (doc.exists) {
                    return doc.data().shippingAddress || "";
                }
            } catch (err) {
                console.error("Error getting address:", err);
            }
        }
        return localStorage.getItem(`user_shipping_address_${email}`) || "";
    },

    async saveShippingAddress(email, address) {
        if (db && email) {
            try {
                let cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                const saveAction = db.collection("profiles").doc(cleanEmail).set({
                    email: email,
                    shippingAddress: address.trim(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                await Promise.race([saveAction, timeoutPromise(5000)]);
            } catch (err) {
                console.error("Error saving address:", err);
            }
        }
        localStorage.setItem(`user_shipping_address_${email}`, address.trim());
    },

    async getWishlist(email) {
        if (db && email) {
            try {
                let cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                let doc = await db.collection("wishlists").doc(cleanEmail).get();
                if (doc.exists) {
                    return doc.data().productIds || [];
                }
            } catch (err) {
                console.error("Error getting wishlist:", err);
            }
        }
        return JSON.parse(localStorage.getItem(`wishlist_${email}`)) || [];
    },

    async syncWishlist(email, wishlistArray) {
        if (db && email) {
            try {
                let cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                const saveAction = db.collection("wishlists").doc(cleanEmail).set({
                    productIds: wishlistArray
                });
                await Promise.race([saveAction, timeoutPromise(5000)]);
            } catch (err) {
                console.error("Error syncing wishlist:", err);
            }
        }
        localStorage.setItem(`wishlist_${email}`, JSON.stringify(wishlistArray));
    },

    async getCart(email) {
        if (db && email) {
            try {
                let cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                let doc = await db.collection("carts").doc(cleanEmail).get();
                if (doc.exists) {
                    let items = doc.data().items || [];
                    return items.map(item => {
                        const product = productsDatabase.find(p => p.id === item.id);
                        return product ? { ...product, quantity: item.quantity } : null;
                    }).filter(Boolean);
                }
            } catch (err) {
                console.error("Error getting cart:", err);
            }
        }
        return JSON.parse(localStorage.getItem(`cart_${email}`)) || [];
    },

    async syncCart(email, cartArray) {
        if (db && email) {
            try {
                let cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                let itemsToSave = cartArray.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                }));
                const saveAction = db.collection("carts").doc(cleanEmail).set({
                    items: itemsToSave
                });
                await Promise.race([saveAction, timeoutPromise(5000)]);
            } catch (err) {
                console.error("Error syncing cart:", err);
            }
        }
        localStorage.setItem("cart_" + email, JSON.stringify(cartArray));
    },

    async getUserRating(email, productId) {
        if (db && email) {
            try {
                let cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                let docId = `${cleanEmail}_${productId}`;
                let doc = await db.collection("ratings_db").doc(docId).get();
                if (doc.exists) {
                    return doc.data().stars;
                }
            } catch (err) {
                console.error("Error getting rating:", err);
            }
        }
        return 0;
    },

    async saveUserRating(email, productId, stars) {
        if (db && email) {
            try {
                let cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                let docId = `${cleanEmail}_${productId}`;
                const saveAction = db.collection("ratings_db").doc(docId).set({
                    userEmail: email,
                    productId: productId,
                    stars: Number(stars)
                });
                await Promise.race([saveAction, timeoutPromise(5000)]);
            } catch (err) {
                console.error("Error saving rating:", err);
            }
        }
    },

    // جلب وتحديث الإعدادات الديناميكية للبانر الإعلاني
    async getBannerConfig() {
        if (db) {
            try {
                let doc = await db.collection("settings").doc("banner").get();
                if (doc.exists) {
                    return doc.data();
                }
            } catch (err) {
                console.error("Error fetching banner config:", err);
            }
        }
        return null;
    },

    async saveBannerConfig(bannerData) {
        if (db) {
            try {
                const saveAction = db.collection("settings").doc("banner").set(bannerData, { merge: true });
                await Promise.race([saveAction, timeoutPromise(5000)]);
                return true;
            } catch (err) {
                if (err.message === "Timeout") {
                    showNotification("فشل تحديث البانر الإعلاني! تأكد من جودة اتصالك بالإنترنت لربط البيانات بالخادم.", "error");
                } else {
                    console.error("Error saving banner config:", err);
                }
            }
        }
        return false;
    },

    // === نظام البانرات المتعددة Amazon Style ===
    async getHeroBanners() {
        if (db) {
            try {
                let snapshot = await db.collection("hero_banners").orderBy("order", "asc").get();
                if (!snapshot.empty) {
                    let banners = [];
                    snapshot.forEach(doc => {
                        banners.push({ id: doc.id, ...doc.data() });
                    });
                    if (banners.length > 0) return banners;
                }
            } catch (err) {
                console.error("Error fetching hero banners:", err);
            }
        }
        const local = localStorage.getItem("amazon_hero_banners");
        if (local) {
            try { return JSON.parse(local); } catch(e){}
        }
        return null;
    },

    async saveHeroBanners(banners) {
        if (db) {
            try {
                const batch = db.batch();
                let oldSnap = await db.collection("hero_banners").get();
                oldSnap.forEach(doc => batch.delete(doc.ref));
                banners.forEach((b, idx) => {
                    const ref = db.collection("hero_banners").doc(b.id || `banner_${Date.now()}_${idx}`);
                    batch.set(ref, {
                        image: b.image,
                        bgColor: b.bgColor || "#E3E6E6",
                        link: b.link || "index.html",
                        title: b.title || "",
                        order: idx
                    });
                });
                await batch.commit();
                localStorage.setItem("amazon_hero_banners", JSON.stringify(banners));
                return true;
            } catch (err) {
                console.error("Error saving hero banners:", err);
            }
        }
        localStorage.setItem("amazon_hero_banners", JSON.stringify(banners));
        return true;
    },

    async addHeroBanner(bannerData) {
        const banners = await this.getHeroBanners() || [];
        const newBanner = {
            id: `banner_${Date.now()}`,
            image: bannerData.image,
            bgColor: bannerData.bgColor || "#E3E6E6",
            link: bannerData.link || "index.html",
            title: bannerData.title || "",
            order: banners.length
        };
        banners.push(newBanner);
        return await this.saveHeroBanners(banners);
    },

    async deleteHeroBanner(bannerId) {
        const banners = await this.getHeroBanners() || [];
        const filtered = banners.filter(b => b.id !== bannerId);
        return await this.saveHeroBanners(filtered);
    }
};

// === محرك تجميع وحساب التقييمات الحقيقية ===
async function fetchAndApplyRealRatings(productsList) {
    if (!db) return productsList;
    try {
        let snapshot = await db.collection("ratings_db").get();
        let ratingsMap = {};

        snapshot.forEach(doc => {
            let data = doc.data();
            let prodId = Number(data.productId);
            let stars = Number(data.stars);

            if (!ratingsMap[prodId]) {
                ratingsMap[prodId] = { totalStars: 0, count: 0 };
            }
            ratingsMap[prodId].totalStars += stars;
            ratingsMap[prodId].count += 1;
        });

        return productsList.map(product => {
            let stats = ratingsMap[product.id];
            if (stats && stats.count > 0) {
                product.rating = parseFloat((stats.totalStars / stats.count).toFixed(1));
                product.reviewsCount = stats.count;
            } else {
                product.rating = 5.0; 
                product.reviewsCount = 0;
            }
            return product;
        });
    } catch (err) {
        console.error("Error calculating real ratings:", err);
        return productsList;
    }
}

// === تخصيص نظام إشعارات إنستغرام التفاعلية العائمة ===
function showNotification(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `instagram-toast toast-${type}-border animate-fade`;
    
    let icon = "🔔";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    if (type === "info") icon = "📩";

    toast.innerHTML = `
        <span style="font-size: 16px;">${icon}</span>
        <span style="flex: 1; line-height: 1.4;">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}

function toggleCart() {
    const drawer = document.getElementById("cart-drawer");
    if (drawer) drawer.classList.toggle("hidden");
}

function toggleMenu() {
    const drawer = document.getElementById("menu-drawer");
    if (drawer) drawer.classList.toggle("hidden");
}

function toggleFilterPopover() {
    const popover = document.getElementById("search-filter-popover");
    if (popover) {
        popover.classList.toggle("hidden");
    }
}

function toggleAccordion(headerEl) {
    const parent = headerEl.parentElement;
    const content = parent.querySelector(".policy-accordion-content");
    const arrow = parent.querySelector(".accordion-arrow");

    if (content) {
        content.classList.toggle("hidden");
        arrow.classList.toggle("rotate-180");
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === "password" ? "text" : "password";
    }
}

// === محرك التبديل السريع للمظهر (OLED Light/Dark Mode Controller) ===
function switchTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("theme", themeName);
    
    const darkBtn = document.getElementById("theme-btn-dark");
    const lightBtn = document.getElementById("theme-btn-light");
    
    if (darkBtn && lightBtn) {
        if (themeName === "dark") {
            darkBtn.classList.add("active");
            lightBtn.classList.remove("active");
        } else {
            lightBtn.classList.add("active");
            darkBtn.classList.remove("active");
        }
    }
}

// === إدارة الدخول والتبديل ===
function toggleAuthMode() {
    const subtitle = document.getElementById("auth-subtitle");
    const mainBtn = document.getElementById("auth-main-btn");
    const toggleLink = document.getElementById("auth-toggle-link");
    const usernameGroup = document.getElementById("username-group");

    if (authMode === "signin") {
        authMode = "signup";
        if (subtitle) subtitle.innerText = "إنشاء حساب جديد مجاناً وبدء التسوق";
        if (mainBtn) mainBtn.innerText = "إنشاء حساب جديد الآن";
        if (toggleLink) toggleLink.innerText = "لديك حساب بالفعل؟ تسجيل الدخول الآن";
        if (usernameGroup) usernameGroup.classList.remove("hidden");
    } else {
        authMode = "signin";
        if (subtitle) subtitle.innerText = "تسجيل الدخول إلى حسابك الخاص";
        if (mainBtn) mainBtn.innerText = "تسجيل الدخول";
        if (toggleLink) toggleLink.innerText = "ليس لديك حساب؟ إنشاء حساب جديد مجاناً";
        if (usernameGroup) usernameGroup.classList.add("hidden");
    }
}

async function submitAuth() {
    const emailInput = document.getElementById("input-email");
    const passwordInput = document.getElementById("input-password");
    const usernameInput = document.getElementById("input-username");
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const username = usernameInput ? usernameInput.value.trim() : "";

    if (!email || !password) {
        showNotification("يرجى كتابة البريد الإلكتروني وكلمة المرور للمتابعة.", "error");
        return;
    }

    if (authMode === "signup" && !username) {
        showNotification("يرجى إدخال اسم المستخدم لإكمال التسجيل.", "error");
        return;
    }

    showNotification("جاري معالجة طلبك لتسجيل الدخول...", "info");

    if (authMode === "signup") {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                await user.updateProfile({ displayName: username });
                
                const cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                if (db) {
                    await db.collection("profiles").doc(cleanEmail).set({
                        email: email,
                        username: username,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
                
                showNotification("تم إنشاء حسابك الجديد وتفعيله بنجاح!", "success");
                await loginSuccess(user.email);
            })
            .catch((error) => {
                showNotification("فشل إنشاء الحساب الجديد: " + error.message, "error");
            });
    } else {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                showNotification("مرحباً بك! تم تسجيل الدخول بنجاح.", "success");
                await loginSuccess(userCredential.user.email);
            })
            .catch((error) => {
                showNotification("فشل تسجيل الدخول، يرجى التحقق من صحة بريدك والرقم السري.", "error");
            });
    }
}

async function handleGoogleAuth() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(async (result) => {
            const user = result.user;
            const cleanEmail = user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
            if (db) {
                await db.collection("profiles").doc(cleanEmail).set({
                    email: user.email,
                    username: user.displayName || "عميل كرياتيف",
                    photoURL: user.photoURL || ""
                }, { merge: true });
            }
            showNotification("تم تسجيل الدخول بنجاح بواسطة حساب Google!", "success");
            await loginSuccess(user.email);
        })
        .catch((error) => {
            showNotification("فشل تسجيل الدخول بواسطة Google: " + error.message, "error");
        });
}

async function handleForgotPassword() {
    const emailInput = document.getElementById("input-email");
    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
        showNotification("يرجى كتابة بريدك الإلكتروني أولاً في خانة البريد بالعلة لتأكيد هويتك.", "error");
        return;
    }

    showNotification("جاري معالجة وإرسال الرابط الآمن...", "info");
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            showNotification("تم إرسال رابط إعادة تعيين كلمة المرور بنجاح لبريدك الإلكتروني!", "success");
        })
        .catch((error) => {
            showNotification("تعذر إرسال الرابط: " + error.message, "error");
        });
}

// === إدارة الأمان والحماية وتأمين الحساب ===
async function submitSecurityReauth() {
    const currentPassInput = document.getElementById("security-current-pass");
    if (!currentPassInput) return;

    const currentPassword = currentPassInput.value;
    if (!currentPassword) {
        showNotification("يرجى كتابة كلمة المرور الحالية أولاً لتفعيل التعديل.", "error");
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) return;

    showNotification("جاري التحقق من ملكية الحساب...", "info");
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

    try {
        const reauthAction = user.reauthenticateWithCredential(credential);
        await Promise.race([reauthAction, timeoutPromise(5000)]);
        
        isUserReauthenticated = true;
        showNotification("تم التحقق من هويتك بنجاح! تم فتح لوحة التعديل بالأسفل.", "success");
        document.getElementById("security-reauth-panel").classList.add("hidden");
        document.getElementById("security-management-panel").classList.remove("hidden");
    } catch (error) {
        if (error.message === "Timeout") {
            showNotification("فشل التحقق بسبب تأخر استجابة الخادم! تأكد من جودة اتصالك بالإنترنت.", "error");
        } else {
            showNotification("فشل تأكيد الهوية، يرجى كتابة الرمز السري الحالي بشكل صحيح.", "error");
        }
        console.error(error);
    }
}

async function submitNewEmail() {
    const newEmailInput = document.getElementById("security-new-email");
    if (!newEmailInput) return;

    const newEmail = newEmailInput.value.trim();
    const user = firebase.auth().currentUser;

    if (!newEmail) {
        showNotification("يرجى كتابة البريد الإلكتروني الجديد أولاً.", "error");
        return;
    }

    showNotification("جاري إرسال الرابط لتأكيد بريدك الجديد...", "info");

    try {
        const verifyAction = user.verifyBeforeUpdateEmail(newEmail);
        await Promise.race([verifyAction, timeoutPromise(5000)]);
        
        showNotification("تم إرسال رابط التحقق بنجاح لبريدك الإلكتروني الجديد! يرجى تفعيله من صندوق الوارد.", "success");
        handleLogout();
    } catch (error) {
        if (error.message === "Timeout") {
            showNotification("تعذر إرسال الرابط بسبب تأخر استجابة خوادم التحقق لجوجل.", "error");
        } else {
            showNotification("فشل إرسال رابط التأكيد: " + error.message, "error");
        }
    }
}

async function submitNewPassword() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    showNotification("جاري معالجة وإرسال رابط التعديل لجيميل...", "info");

    try {
        const resetAction = firebase.auth().sendPasswordResetEmail(user.email);
        await Promise.race([resetAction, timeoutPromise(5000)]);
        
        showNotification("تم إرسال رابط إعادة تعيين كلمة المرور بنجاح لجيميل الخاص بك!", "success");
    } catch (error) {
        if (error.message === "Timeout") {
            showNotification("تعذر الاتصال بخوادم بريد جوجل لإرسال الرابط! تفقد جودة اتصالك بالإنترنت.", "error");
        } else {
            showNotification("فشل إرسال الرابط: " + error.message, "error");
        }
    }
}

async function submitDirectNewPassword() {
    const newPasswordInput = document.getElementById("security-new-password");
    if (!newPasswordInput) return;

    const newPassword = newPasswordInput.value;
    const user = firebase.auth().currentUser;

    if (!newPassword || newPassword.length < 6) {
        showNotification("يجب أن تكون كلمة المرور الجديدة مكونة من 6 خانات أو أكثر.", "error");
        return;
    }

    showNotification("جاري معالجة وتأمين تحديث كلمة المرور...", "info");

    try {
        const updateAction = user.updatePassword(newPassword);
        await Promise.race([updateAction, timeoutPromise(5000)]);
        
        showNotification("تم تحديث كلمة المرور لرمزك الجديد بنجاح!", "success");
        handleLogout();
    } catch (error) {
        if (error.message === "Timeout") {
            showNotification("فشل التحديث بسبب تأخر استجابة الخادم وتأمين التعديل.", "error");
        } else {
            showNotification("فشل تحديث كلمة المرور المباشر: " + error.message, "error");
        }
    }
}

// === نظام الإشعار الإداري السحابي الموحد ===
async function publishGlobalAnnouncement() {
    const textInput = document.getElementById("admin-broadcast-text");
    if (!textInput) return;

    const text = textInput.value.trim();
    if (!text) {
        showNotification("يرجى كتابة نص الإشعار أولاً.", "error");
        return;
    }

    if (db) {
        try {
            await db.collection("announcements").doc("global").set({
                message: text,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification("تم نشر الإشعار العام بنجاح لجميع العملاء!", "success");
        } catch (e) {
            showNotification("فشل النشر: " + e.message, "error");
        }
    }
}

// مسح الإعلان العام
async function clearGlobalAnnouncement() {
    if (db) {
        try {
            await db.collection("announcements").doc("global").delete();
            showNotification("تم إزالة الإشعار بنجاح.", "success");
            const textInput = document.getElementById("admin-broadcast-text");
            if (textInput) textInput.value = "";
        } catch (e) {
            showNotification("فشل الإزالة: " + e.message, "error");
        }
    }
}

function syncLiveAnnouncement() {
    const banner = document.getElementById("global-announcement-banner");
    if (db && banner) {
        db.collection("announcements").doc("global").onSnapshot((doc) => {
            if (doc.exists && doc.data().message) {
                banner.innerText = doc.data().message;
                banner.classList.remove("hidden");
            } else {
                banner.classList.add("hidden");
            }
        });
    }
}

function updateHeaderProfileUI(user) {
    const profileBtn = document.getElementById("header-profile-btn");
    if (!profileBtn) return;
    
    if (user) {
        const cleanEmail = user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
        if (db) {
            db.collection("profiles").doc(cleanEmail).get().then(doc => {
                if (doc.exists && doc.data().photoURL) {
                    profileBtn.innerHTML = `<img src="${doc.data().photoURL}" alt="Profile" class="header-profile-img">`;
                } else if (user.photoURL) {
                    profileBtn.innerHTML = `<img src="${user.photoURL}" alt="Profile" class="header-profile-img">`;
                } else {
                    profileBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    `;
                }
            }).catch(() => {
                profileBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                `;
            });
        }
    } else {
        profileBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;
    }
}

// دمج أزرار وعمليات التكبير والقص للرمز الشخصي التفاعلي
async function uploadAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        showNotification("يرجى تسجيل الدخول أولاً لتعديل الصورة.", "error");
        return;
    }

    activeCropFile = file;
    activeCropScale = 1;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        const imgEl = document.getElementById("crop-preview-img");
        const zoomSlider = document.getElementById("crop-zoom-slider");
        const modal = document.getElementById("avatar-crop-modal");

        if (imgEl && modal) {
            imgEl.src = e.target.result;
            imgEl.style.transform = "scale(1)";
            if (zoomSlider) zoomSlider.value = 1;
            modal.classList.remove("hidden");
        }
    };
}

function applyLocalAvatarZoom(val) {
    activeCropScale = parseFloat(val);
    const imgEl = document.getElementById("crop-preview-img");
    if (imgEl) {
        imgEl.style.transform = `scale(${activeCropScale})`;
    }
}

async function saveCroppedAvatar() {
    const imgEl = document.getElementById("crop-preview-img");
    if (!imgEl || !activeCropFile) return;

    showNotification("جاري معالجة وتأطير صورتك الشخصية بذكاء...", "info");

    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = imgEl.src;

        img.onload = async () => {
            const size = 300; 
            canvas.width = size;
            canvas.height = size;

            const scale = activeCropScale;
            const sw = img.width / scale;
            const sh = img.height / scale;
            const sx = (img.width - sw) / 2;
            const sy = (img.height - sh) / 2;

            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
            const processedBase64 = canvas.toDataURL("image/jpeg", 0.7);

            const user = firebase.auth().currentUser;
            const cleanEmail = user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
            
            if (db) {
                await db.collection("profiles").doc(cleanEmail).set({
                    photoURL: processedBase64
                }, { merge: true });
            }

            showNotification("تم تحديث وحفظ صورتك الشخصية بنجاح!", "success");
            closeCropModal();
            
            const headerProfileBtn = document.getElementById("header-profile-btn");
            if (headerProfileBtn) {
                headerProfileBtn.innerHTML = `<img src="${processedBase64}" alt="Profile" class="header-profile-img">`;
            }
            loadProfileData();
        };
    } catch (err) {
        console.error("Avatar Crop Error:", err);
        showNotification("تعذر قص وحفظ الصورة، حاول مجدداً.", "error");
    }
}

function closeCropModal() {
    const modal = document.getElementById("avatar-crop-modal");
    if (modal) modal.classList.add("hidden");
    activeCropFile = null;
}

async function updateProfileName() {
    const nameInput = document.getElementById("profile-username-input");
    if (!nameInput) return;
    const newName = nameInput.value.trim();

    if (!newName) {
        showNotification("يرجى كتابة الاسم أولاً.", "error");
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) return;

    showNotification("جاري تعديل اسمك الشخصي المعتمد...", "info");

    try {
        await user.updateProfile({ displayName: newName });
        const cleanEmail = user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
        if (db) {
            await db.collection("profiles").doc(cleanEmail).set({
                username: newName
            }, { merge: true });
        }
        
        await user.reload();
        showNotification("تم تحديث اسم الحساب المعتمد بنجاح!", "success");
        loadProfileData();
    } catch (err) {
        console.error("Update Name Error:", err);
        showNotification("حدث خطأ أثناء تعديل الاسم.", "error");
    }
}

// === محرك الرفع الفوري والمباشر مع مكبس صور Canvas ذكي للغاية وموفر للمساحة ===
async function uploadProductImageToFirebase(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                
                const max_width = 800;
                let width = img.width;
                let height = img.height;
                
                if (width > max_width) {
                    height = Math.round((height * max_width) / width);
                    width = max_width;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
                resolve(compressedBase64);
            };
            img.onerror = (e) => reject(new Error("فشل معالجة أبعاد الصورة: " + e));
        };
        reader.onerror = (e) => reject(new Error("تعذر قراءة ملف الصورة: " + e));
    });
}

// === نظام تبويب الإدارة واختصارات المساحة ===
function switchAdminTab(tabName) {
    const panels = {
        announcement: document.getElementById("admin-broadcast-panel"),
        banner: document.getElementById("admin-banner-panel"),
        products: document.getElementById("admin-products-control-panel")
    };

    const buttons = {
        announcement: document.getElementById("tab-btn-announcement"),
        banner: document.getElementById("tab-btn-banner"),
        products: document.getElementById("tab-btn-products")
    };

    Object.keys(panels).forEach(key => {
        if (panels[key]) panels[key].classList.add("hidden");
        if (buttons[key]) buttons[key].classList.remove("active");
    });

    if (panels[tabName]) panels[tabName].classList.remove("hidden");
    if (buttons[tabName]) buttons[tabName].classList.add("active");
}

// === نظام البانر الإعلاني المتحرك Amazon Style - يغير لون الخلفية السحري بالتلاشي ===
let heroCurrentIndex = 0;
let heroBannersData = [];
let heroAutoPlayInterval = null;
let heroIsDragging = false;
let heroStartX = 0;

const defaultAmazonBanners = [
    {
        id: "banner_1",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1500&h=600&q=80",
        bgColor: "#E9D5FF",
        link: "category.html?type=printing",
        title: "أسبوع الجمال"
    },
    {
        id: "banner_2", 
        image: "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=1500&h=600&q=80",
        bgColor: "#FEF3C7",
        link: "category.html?type=toys",
        title: "اشتري دلوقتي وادفع بعدين"
    },
    {
        id: "banner_3",
        image: "https://images.unsplash.com/photo-1441984904996-e0b26ba7a1d7?auto=format&fit=crop&w=1500&h=600&q=80",
        bgColor: "#DBEAFE",
        link: "category.html?type=colors",
        title: "عروض الموضة حتى 50%"
    },
    {
        id: "banner_4",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1500&h=600&q=80",
        bgColor: "#FDE68A",
        link: "category.html?type=books",
        title: "ماركات عالمية توصلك لحد البيت"
    }
];

function extractDominantColorFromImage(imgElement) {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 10;
            canvas.height = 10;
            ctx.drawImage(imgElement, 0, 0, 10, 10);
            const data = ctx.getImageData(0, 0, 10, 2).data;
            let r=0,g=0,b=0,count=0;
            for (let i=0;i<data.length;i+=4){
                r+=data[i]; g+=data[i+1]; b+=data[i+2]; count++;
            }
            r=Math.round(r/count); g=Math.round(g/count); b=Math.round(b/count);
            const hex = `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
            resolve(hex);
        } catch(e){
            resolve("#E3E6E6");
        }
    });
}

async function renderPromoBanner() {
    const bannerContainer = document.getElementById("dynamic-promo-banner");
    if (!bannerContainer) return;

    let banners = await API.getHeroBanners();
    if (!banners || banners.length === 0) {
        const oldBanner = await API.getBannerConfig();
        if (oldBanner && oldBanner.imageUrl) {
            banners = [{
                id: "legacy_1",
                image: oldBanner.imageUrl,
                bgColor: oldBanner.bgColor || "#E9D5FF",
                link: oldBanner.btnLink || "index.html",
                title: "عرض خاص"
            }];
        } else {
            banners = defaultAmazonBanners;
        }
    }

    heroBannersData = banners;
    
    bannerContainer.innerHTML = `
        <div id="amazon-hero-wrapper" class="amazon-hero-wrapper" style="--banner-bg-color: ${banners[0].bgColor}">
            <div id="amazon-hero-bg-layer" class="amazon-hero-bg-layer"></div>
            <div class="amazon-hero-viewport" id="amazon-hero-viewport">
                <div class="hero-slides-track" id="hero-slides-track">
                    ${banners.map((banner, idx) => `
                        <div class="hero-slide ${idx===0?'active':''}" data-index="${idx}" data-bg="${banner.bgColor}">
                            <a href="${banner.link}" class="hero-slide-link">
                                <img src="${banner.image}" alt="${banner.title}" loading="${idx===0?'eager':'lazy'}" crossorigin="anonymous" onload="if(!this.dataset.colored){ this.dataset.colored='1'; window.tryAutoColor && window.tryAutoColor(this, ${idx}) }">
                            </a>
                        </div>
                    `).join('')}
                </div>
                <button class="hero-arrow hero-arrow-prev" onclick="heroPrevSlide()" aria-label="السابق"></button>
                <button class="hero-arrow hero-arrow-next" onclick="heroNextSlide()" aria-label="التالي"></button>
            </div>
            <div class="amazon-hero-fade"></div>
            <div class="hero-dots" id="hero-dots">
                ${banners.map((_, idx) => `<button class="hero-dot ${idx===0?'active':''}" onclick="heroGoToSlide(${idx})" aria-label="بانر ${idx+1}"></button>`).join('')}
            </div>
        </div>
    `;

    initHeroTouchEvents();
    startHeroAutoPlay();

    const wrapper = document.getElementById("amazon-hero-wrapper");
    if (wrapper) {
        wrapper.addEventListener("mouseenter", stopHeroAutoPlay);
        wrapper.addEventListener("mouseleave", startHeroAutoPlay);
    }

    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
        mainContent.style.position = "relative";
        mainContent.style.zIndex = "2";
        mainContent.style.marginTop = "-120px";
        mainContent.style.paddingTop = "140px";
    }

    window.tryAutoColor = async (imgEl, idx) => {
        if (heroBannersData[idx] && (!heroBannersData[idx].bgColor || heroBannersData[idx].bgColor === "#E3E6E6")) {
            const color = await extractDominantColorFromImage(imgEl);
            heroBannersData[idx].bgColor = color;
            if (idx === heroCurrentIndex) {
                updateHeroBackground(color);
            }
            const slide = document.querySelector(`.hero-slide[data-index="${idx}"]`);
            if (slide) slide.dataset.bg = color;
        }
    };
}

// تعديل الدالة لتبديل المتغير البرمجي الفعال للـ CSS بدلاً من فرض لون صلب
function updateHeroBackground(color) {
    const wrapper = document.getElementById("amazon-hero-wrapper");
    const bgLayer = document.getElementById("amazon-hero-bg-layer");
    if (wrapper) {
        wrapper.style.setProperty('--banner-bg-color', color);
    }
    if (bgLayer) {
        bgLayer.style.setProperty('--banner-bg-color', color);
    }
}

function heroGoToSlide(index) {
    if (index < 0) index = heroBannersData.length - 1;
    if (index >= heroBannersData.length) index = 0;
    
    heroCurrentIndex = index;
    
    document.querySelectorAll(".hero-slide").forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
    });
    
    document.querySelectorAll(".hero-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });

    const bgColor = heroBannersData[index]?.bgColor || document.querySelector(`.hero-slide[data-index="${index}"]`)?.dataset.bg || "#E3E6E6";
    updateHeroBackground(bgColor);
}

function heroNextSlide() {
    heroGoToSlide(heroCurrentIndex + 1);
}

function heroPrevSlide() {
    heroGoToSlide(heroCurrentIndex - 1);
}

function startHeroAutoPlay() {
    stopHeroAutoPlay();
    heroAutoPlayInterval = setInterval(() => {
        heroNextSlide();
    }, 5000);
}

function stopHeroAutoPlay() {
    if (heroAutoPlayInterval) {
        clearInterval(heroAutoPlayInterval);
        heroAutoPlayInterval = null;
    }
}

function initHeroTouchEvents() {
    const viewport = document.getElementById("amazon-hero-viewport");
    if (!viewport) return;

    viewport.addEventListener("touchstart", (e) => {
        heroIsDragging = true;
        heroStartX = e.touches[0].clientX;
        stopHeroAutoPlay();
    }, {passive: true});

    viewport.addEventListener("touchend", (e) => {
        if (!heroIsDragging) return;
        heroIsDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = heroStartX - endX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) heroNextSlide();
            else heroPrevSlide();
        }
        startHeroAutoPlay();
    }, {passive: true});

    viewport.addEventListener("mousedown", (e) => {
        heroIsDragging = true;
        heroStartX = e.clientX;
        stopHeroAutoPlay();
    });

    viewport.addEventListener("mouseup", (e) => {
        if (!heroIsDragging) return;
        heroIsDragging = false;
        const diff = heroStartX - e.clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) heroNextSlide();
            else heroPrevSlide();
        }
        startHeroAutoPlay();
    });
}

// إدارة البانرات من لوحة التحكم - إضافة بانر جديد بالألوان
async function handleAdminUpdateBanner() {
    const btnLink = document.getElementById("admin-banner-btn-link")?.value.trim() || "index.html";
    const title = document.getElementById("admin-banner-title")?.value.trim() || "";
    const bgColor = document.getElementById("admin-banner-bg-color")?.value || "#E9D5FF";
    const imageFileInput = document.getElementById("admin-banner-image-file");

    if (!imageFileInput || !imageFileInput.files || !imageFileInput.files[0]) {
        const imageUrlInput = document.getElementById("admin-banner-image-url");
        const imageUrl = imageUrlInput ? imageUrlInput.value.trim() : "";
        if (!imageUrl) {
            showNotification("يرجى اختيار صورة للبانر أولاً.", "error");
            return;
        }
        showNotification("جاري إضافة البانر الجديد...", "info");
        const success = await API.addHeroBanner({
            image: imageUrl,
            bgColor: bgColor,
            link: btnLink,
            title: title
        });
        if (success) {
            showNotification("تم إضافة البانر بنجاح! سيظهر في الشريط المتحرك.", "success");
            renderPromoBanner();
            loadAdminHeroBannersList();
        }
        return;
    }

    showNotification("جاري رفع الصورة وإضافة البانر...", "info");

    try {
        const imageUrl = await uploadProductImageToFirebase(imageFileInput.files[0]);
        if (!imageUrl) {
            showNotification("فشل رفع الصورة.", "error");
            return;
        }

        const success = await API.addHeroBanner({
            image: imageUrl,
            bgColor: bgColor,
            link: btnLink,
            title: title
        });

        if (success) {
            showNotification("تم إضافة البانر بنجاح بألوانه الجديدة!", "success");
            renderPromoBanner();
            loadAdminHeroBannersList();
            if (imageFileInput) imageFileInput.value = "";
            const urlInput = document.getElementById("admin-banner-image-url");
            if (urlInput) urlInput.value = "";
        } else {
            showNotification("فشل حفظ البانر.", "error");
        }
    } catch (e) {
        showNotification("خطأ: " + e.message, "error");
    }
}

async function loadAdminHeroBannersList() {
    const listContainer = document.getElementById("admin-hero-banners-list");
    if (!listContainer) return;

    const banners = await API.getHeroBanners() || [];
    
    if (banners.length === 0) {
        listContainer.innerHTML = `<p class="text-xs text-gray-500 text-center py-4">لا توجد بانرات حالياً. أضف أول بانر أعلاه.</p>`;
        return;
    }

    listContainer.innerHTML = banners.map((b, idx) => `
        <div class="flex items-center gap-3 p-3 rounded-xl border border-gray-800 bg-black bg-opacity-30">
            <div class="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700" style="background-color:${b.bgColor}">
                <img src="${b.image}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-white truncate">${b.title || 'بانر ' + (idx+1)}</p>
                <div class="flex items-center gap-2 mt-1">
                    <span class="w-4 h-4 rounded-full border border-white border-opacity-30" style="background:${b.bgColor}"></span>
                    <span class="text-[10px] text-gray-400 truncate">${b.bgColor}</span>
                </div>
            </div>
            <div class="flex gap-1">
                <button onclick="deleteHeroBannerById('${b.id}')" class="bg-red-500 bg-opacity-20 text-red-400 px-2 py-1 rounded-full text-[10px] hover:bg-opacity-30">حذف</button>
            </div>
        </div>
    `).join('');
}

async function deleteHeroBannerById(bannerId) {
    if (!confirm("هل أنت متأكد من حذف هذا البانر؟")) return;
    const success = await API.deleteHeroBanner(bannerId);
    if (success) {
        showNotification("تم حذف البانر.", "success");
        renderPromoBanner();
        loadAdminHeroBannersList();
    }
}

// تحميل قائمة البانرات عند فتح تبويب البانر
const originalSwitchTab = window.switchAdminTab;
window.switchAdminTab = function(tabName) {
    if (originalSwitchTab) originalSwitchTab(tabName);
    else {
        const panels = {
            announcement: document.getElementById("admin-broadcast-panel"),
            banner: document.getElementById("admin-banner-panel"),
            products: document.getElementById("admin-products-control-panel")
        };
        const buttons = {
            announcement: document.getElementById("tab-btn-announcement"),
            banner: document.getElementById("tab-btn-banner"),
            products: document.getElementById("tab-btn-products")
        };
        Object.keys(panels).forEach(key => {
            if (panels[key]) panels[key].classList.add("hidden");
            if (buttons[key]) buttons[key].classList.remove("active");
        });
        if (panels[tabName]) panels[tabName].classList.remove("hidden");
        if (buttons[tabName]) buttons[tabName].classList.add("active");
    }
    
    if (tabName === 'banner') {
        setTimeout(() => loadAdminHeroBannersList(), 200);
    }
};

// === إدارة لوحة التحكم الشاملة بالمنتجات لمالك المتجر ===
async function handleAdminPublishProduct() {
    const name = document.getElementById("admin-prod-name").value.trim();
    const description = document.getElementById("admin-prod-desc").value.trim();
    const price = parseFloat(document.getElementById("admin-prod-price").value);
    const originalPrice = parseFloat(document.getElementById("admin-prod-orig-price").value) || null;
    const discount = document.getElementById("admin-prod-discount").value.trim() || null;
    const category = document.getElementById("admin-prod-category").value;
    const fileInput = document.getElementById("admin-prod-image-file");

    if (!name || !description || isNaN(price)) {
        showNotification("يرجى تعبئة الحقول الأساسية: الاسم، الوصف، والسعر الحالي.", "error");
        return;
    }

    if (!fileInput.files || !fileInput.files[0]) {
        showNotification("يرجى اختيار صورة للمنتج ليتم رفعها.", "error");
        return;
    }

    showNotification("جاري معالجة ونشر المنتج الجديد في قاعدة البيانات...", "info");

    try {
        const imageUrl = await uploadProductImageToFirebase(fileInput.files[0]);
        showNotification("تم رفع الصورة وتأمينها في قاعدة البيانات بنجاح!", "success");

        const newId = productsDatabase.length > 0 ? Math.max(...productsDatabase.map(p => p.id)) + 1 : 1;

        const productPayload = {
            id: newId,
            name: name,
            description: description,
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            category: category,
            image: imageUrl,
            rating: 5.0,
            reviewsCount: 0
        };

        const success = await API.saveSingleProduct(productPayload);
        if (success) {
            showNotification("تم نشر المنتج الجديد بنجاح في المتجر وعرضه للجميع!", "success");
            
            document.getElementById("admin-prod-name").value = "";
            document.getElementById("admin-prod-desc").value = "";
            document.getElementById("admin-prod-price").value = "";
            document.getElementById("admin-prod-orig-price").value = "";
            document.getElementById("admin-prod-discount").value = "";
            document.getElementById("admin-prod-image-file").value = "";

            let rawProducts = await API.getProducts();
            productsDatabase = await fetchAndApplyRealRatings(rawProducts);
            renderAdminProductsManager();
        } else {
            showNotification("فشل حفظ المنتج في قاعدة البيانات.", "error");
        }
    } catch (error) {
        showNotification("فشل نشر المنتج: " + error.message, "error");
    }
}

function renderAdminProductsManager() {
    const listContainer = document.getElementById("admin-products-manager-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    if (productsDatabase.length === 0) {
        listContainer.innerHTML = `<p class="p-4 text-center text-gray-500 text-xs">لا توجد منتجات حالياً بالمتجر لعرضها.</p>`;
        return;
    }

    productsDatabase.forEach(product => {
        listContainer.innerHTML += `
            <div class="admin-product-row-card border-main-b py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style="border-bottom: 1px solid var(--border-color);">
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded-lg flex-shrink-0" style="border: 1px solid var(--border-color);">
                    <div class="w-full">
                        <input type="text" id="admin-edit-name-${product.id}" value="${product.name}" class="interactive-address-input py-1 px-2 text-xs w-full mb-1" style="font-weight: bold;">
                        <div class="flex gap-2">
                            <span class="text-xs text-gray-400">كود: ${product.id}</span>
                            <span class="text-xs text-accent">القسم الحالي: ${product.category}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <div class="flex flex-col gap-1">
                        <label class="text-gray-400" style="font-size: 9px;">السعر الحالي (ج.م)</label>
                        <input type="number" id="admin-edit-price-${product.id}" value="${product.price}" class="interactive-address-input py-1 px-2 text-xs w-20">
                    </div>
                    
                    <div class="flex flex-col gap-1">
                        <label class="text-gray-400" style="font-size: 9px;">القسم</label>
                        <select id="admin-edit-cat-${product.id}" class="interactive-address-input py-1 px-2 text-xs w-24" style="background-color: var(--bg-main);">
                            <option value="printing" ${product.category === "printing" ? "selected" : ""}>طباعة</option>
                            <option value="toys" ${product.category === "toys" ? "selected" : ""}>ألعاب</option>
                            <option value="colors" ${product.category === "colors" ? "selected" : ""}>ألوان ورسم</option>
                            <option value="books" ${product.category === "books" ? "selected" : ""}>كتب وكراسات</option>
                        </select>
                    </div>

                    <div class="flex gap-1 mt-3 md:mt-0">
                        <button onclick="saveAdminProductChanges(${product.id})" class="action-pill-btn text-xs py-2 px-3" style="font-size: 10px; width: auto; margin:0; padding: 6px 12px;">حفظ</button>
                        <button onclick="deleteAdminProduct(${product.id})" class="logout-btn text-xs py-2 px-3" style="font-size: 10px; width: auto; margin:0; padding: 6px 12px; background-color: rgba(239, 68, 68, 0.15);">حذف</button>
                    </div>
                </div>
            </div>
        `;
    });
}

async function saveAdminProductChanges(productId) {
    const updatedName = document.getElementById(`admin-edit-name-${productId}`).value.trim();
    const updatedPrice = parseFloat(document.getElementById(`admin-edit-price-${productId}`).value);
    const updatedCategory = document.getElementById(`admin-edit-cat-${productId}`).value;

    if (!updatedName || isNaN(updatedPrice)) {
        showNotification("يرجى إدخال اسم وسعر صحيح للتعديل.", "error");
        return;
    }

    showNotification("جاري معالجة وتعديل تفاصيل المنتج...", "info");

    const originalProduct = productsDatabase.find(p => p.id === productId);
    if (!originalProduct) return;

    const updatedProduct = {
        ...originalProduct,
        name: updatedName,
        price: updatedPrice,
        category: updatedCategory
    };

    const success = await API.saveSingleProduct(updatedProduct);
    if (success) {
        showNotification("تم حفظ وتحديث تعديلات المنتج بنجاح!", "success");
        let rawProducts = await API.getProducts();
        productsDatabase = await fetchAndApplyRealRatings(rawProducts);
        renderAdminProductsManager();
    } else {
        showNotification("فشل تحديث بيانات المنتج.", "error");
    }
}

async function deleteAdminProduct(productId) {
    if (!confirm("هل أنت متأكد تماماً من رغبتك في حذف هذا المنتج نهائياً من قاعدة بيانات المتجر؟")) {
        return;
    }

    showNotification("جاري إزالة المنتج نهائياً من قاعدة البيانات...", "info");

    const success = await API.deleteProduct(productId);
    if (success) {
        showNotification("تم إزالة المنتج نهائياً من قاعدة البيانات وتحديث المتجر.", "success");
        let rawProducts = await API.getProducts();
        productsDatabase = await fetchAndApplyRealRatings(rawProducts);
        renderAdminProductsManager();
    } else {
        showNotification("فشل إزالة المنتج.", "error");
    }
}

// === إدارة نسب وتوزيع تقييمات أمازون التفاعلية (Amazon Rating Breakdown Logic) ===
async function openRatingBreakdown(productId) {
    const product = productsDatabase.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("rating-breakdown-modal");
    const averageRatingEl = document.getElementById("modal-average-rating");
    const averageStarsEl = document.getElementById("modal-average-stars");
    const totalReviewsEl = document.getElementById("modal-total-reviews");
    const barsContainer = document.getElementById("modal-rating-bars-container");

    if (!modal || !averageRatingEl || !averageStarsEl || !totalReviewsEl || !barsContainer) return;

    let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalCount = 0;

    if (db) {
        try {
            let snapshot = await db.collection("ratings_db").where("productId", "==", productId).get();
            snapshot.forEach(doc => {
                let stars = Number(doc.data().stars);
                if (distribution[stars] !== undefined) {
                    distribution[stars] += 1;
                    totalCount += 1;
                }
            });
        } catch (e) {
            console.error("Error fetching rating distribution:", e);
        }
    }

    if (totalCount === 0) {
        distribution = { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 };
        totalCount = 1;
    }

    averageRatingEl.innerText = product.rating.toFixed(1);
    
    let starsHTML = "";
    const roundedRating = Math.round(product.rating);
    for (let i = 1; i <= 5; i++) {
        starsHTML += (i <= roundedRating) ? "★" : "☆";
    }
    averageStarsEl.innerText = starsHTML;
    totalReviewsEl.innerText = `(${product.reviewsCount} تقييم عملاء)`;

    barsContainer.innerHTML = "";
    for (let i = 5; i >= 1; i--) {
        const count = distribution[i];
        const pct = Math.round((count / totalCount) * 100);
        
        barsContainer.innerHTML += `
            <div class="flex items-center gap-3 text-xs w-full">
                <span class="w-12 text-left font-bold" style="color:var(--text-muted);">${i} نجوم</span>
                <div class="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden" style="background-color: var(--btn-dark-bg); border: 1px solid var(--border-color);">
                    <div class="h-full rounded-full" style="width: ${pct}%; background-color: var(--amazon-orange); transition: width 0.6s ease;"></div>
                </div>
                <span class="w-8 text-right font-bold" style="color:var(--text-color);">${pct}%</span>
            </div>
        `;
    }

    modal.classList.remove("hidden");
}

function closeRatingBreakdown() {
    const modal = document.getElementById("rating-breakdown-modal");
    if (modal) modal.classList.add("hidden");
}

// === إدارة السلة والواجهة وعنوان الشحن والمفضلة السحابية الآمنة ضد التوقف ===
async function loadProfileData() {
    const addressInput = document.getElementById("shipping-address-input");
    const profilePhoneEl = document.getElementById("user-profile-phone");
    const profileUsernameInput = document.getElementById("profile-username-input");
    const avatarContainer = document.getElementById("profile-avatar-container");
    const user = firebase.auth().currentUser;

    if (!user) return;

    const adminTabsNav = document.getElementById("admin-tabs-navigation");
    const adminPanel = document.getElementById("admin-broadcast-panel");
    const adminBannerPanel = document.getElementById("admin-banner-panel");
    const adminProductPanel = document.getElementById("admin-products-control-panel");
    const launcher = document.getElementById("floating-admin-launcher");
    
    if (user.email === "creativehousestoresupport@gmail.com") {
        if (adminTabsNav) {
            adminTabsNav.classList.remove("hidden");
        }
        if (launcher) {
            launcher.classList.remove("hidden"); 
        }
        
        try {
            if (adminPanel && db) {
                db.collection("announcements").doc("global").get().then(doc => {
                    if (doc.exists) {
                        const txtEl = document.getElementById("admin-broadcast-text");
                        if (txtEl) txtEl.value = doc.data().message || "";
                    }
                }).catch(err => console.error(err));
            }
        } catch (e) { console.error(e); }

        try {
            if (adminBannerPanel && db) {
                API.getBannerConfig().then(bannerData => {
                    if (bannerData) {
                        const btnLinkEl = document.getElementById("admin-banner-btn-link");
                        if (btnLinkEl) btnLinkEl.value = bannerData.btnLink || "";
                    }
                }).catch(err => console.error(err));
            }
        } catch (e) { console.error(e); }

        try {
            if (adminProductPanel) {
                renderAdminProductsManager();
            }
        } catch (e) { console.error(e); }

        try {
            switchAdminTab("announcement");
        } catch (e) { console.error(e); }

    } else {
        if (adminTabsNav) adminTabsNav.classList.add("hidden");
        if (adminPanel) adminPanel.classList.add("hidden");
        if (adminBannerPanel) adminBannerPanel.classList.add("hidden");
        if (adminProductPanel) adminProductPanel.classList.add("hidden");
        if (launcher) launcher.classList.add("hidden");
    }

    if (profilePhoneEl) {
        profilePhoneEl.innerText = user.displayName || user.email;
    }
    if (profileUsernameInput) {
        profileUsernameInput.value = user.displayName || "";
    }
    
    if (avatarContainer) {
        try {
            const cleanEmail = user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
            if (db) {
                const doc = await db.collection("profiles").doc(cleanEmail).get();
                if (doc.exists && doc.data().photoURL) {
                    avatarContainer.innerHTML = `<img src="${doc.data().photoURL}" alt="User Avatar" class="w-full h-full object-cover rounded-full">`;
                } else if (user.photoURL) {
                    avatarContainer.innerHTML = `<img src="${user.photoURL}" alt="User Avatar" class="w-full h-full object-cover rounded-full">`;
                } else {
                    avatarContainer.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-black">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    `;
                }
            } else if (user.photoURL) {
                avatarContainer.innerHTML = `<img src="${user.photoURL}" alt="User Avatar" class="w-full h-full object-cover rounded-full">`;
            }
        } catch (e) {
            console.error("Firestore avatar fetch failed, trying Auth photoURL:", e);
            if (user.photoURL) {
                avatarContainer.innerHTML = `<img src="${user.photoURL}" alt="User Avatar" class="w-full h-full object-cover rounded-full">`;
            }
        }
    }

    if (addressInput) {
        try {
            const address = await API.getShippingAddress(user.email);
            addressInput.value = address;
        } catch (e) { console.error(e); }
    }

    try {
        renderWishlist();
    } catch (e) { console.error(e); }

    const activeTheme = localStorage.getItem("theme") || "dark";
    const darkBtn = document.getElementById("theme-btn-dark");
    const lightBtn = document.getElementById("theme-btn-light");
    if (darkBtn && lightBtn) {
        if (activeTheme === "dark") {
            darkBtn.classList.add("active");
            lightBtn.classList.remove("active");
        } else {
            lightBtn.classList.add("active");
            darkBtn.classList.remove("active");
        }
    }
}

async function updateShippingAddress(newAddress) {
    const user = firebase.auth().currentUser;
    if (user) {
        await API.saveShippingAddress(user.email, newAddress.trim());
        showNotification("تم تحديث وحفظ تفاصيل العنوان بنجاح المعتمد.", "success");
    }
}

async function submitUserRating(productId, starsValue) {
    if (!userPhoneNumber) {
        window.location.href = "auth.html";
        return;
    }
    await API.saveUserRating(userPhoneNumber, productId, starsValue);
    showNotification("شكراً لتقييمك ومشاركتك لتجربتك الفخرية للمنتج!", "success");
    
    let rawProducts = await API.getProducts();
    productsDatabase = await fetchAndApplyRealRatings(rawProducts);
    
    renderHomeProducts();
    renderProductDetailsPage();
    renderCategoryPageProducts();
}

async function toggleWishlist(productId) {
    if (!userPhoneNumber) {
        window.location.href = "auth.html";
        return;
    }
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification("تم إزالة المنتج من مفضلتك الشخصية.", "info");
    } else {
        wishlist.push(productId);
        showNotification("تم إضافة المنتج بنجاح لمفضلتك الشخصية!", "success");
    }
    await API.syncWishlist(userPhoneNumber, wishlist);
    renderHomeProducts();
    renderProductDetailsPage();
}

function renderWishlist() {
    const grid = document.getElementById("wishlist-results-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const savedProducts = productsDatabase.filter(p => wishlist.includes(p.id));

    if (savedProducts.length === 0) {
        grid.innerHTML = `<p class="p-4 text-center text-gray-500 w-full col-span-2 text-xs">قائمة المفضلة فارغة حالياً.</p>`;
        return;
    }

    savedProducts.forEach(product => {
        grid.innerHTML += `
            <div class="product-card" onclick="window.location.href='product-details.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="card-details">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="current-price">${product.price.toFixed(2)}</p>
                </div>
            </div>
        `;
    });
}

async function addToCart(productId) {
    if (!userPhoneNumber) {
        window.location.href = "auth.html";
        return;
    }
    const product = productsDatabase.find(p => p.id === productId);
    const itemInCart = cart.find(item => item.id === productId);

    if (itemInCart) {
        itemInCart.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    showNotification("تم إضافة المنتج بنجاح إلى سلة المشتريات!", "success");
    await API.syncCart(userPhoneNumber, cart);
}

async function updateQuantity(productId, amount) {
    if (!userPhoneNumber) return;
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCartUI();
        await API.syncCart(userPhoneNumber, cart);
    }
}

function updateCartUI() {
    const list = document.getElementById("cart-items-list");
    const totalCountBadge = document.getElementById("cart-count");
    const totalPriceEl = document.getElementById("cart-total");

    if (!list) return;
    list.innerHTML = "";
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        list.innerHTML = `<li class="p-4 text-center text-gray-500">سلتك فارغة حالياً</li>`;
        if (totalCountBadge) totalCountBadge.classList.add("hidden");
        if (totalPriceEl) totalPriceEl.textContent = "0.00 ج.م";
        return;
    }

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        list.innerHTML += `
            <li class="cart-item">
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name} (${item.quantity})</h3>
                    <p class="cart-item-price">${(item.price * item.quantity).toFixed(2)} ج.م</p>
                    <div class="cart-item-stepper-row">
                        <button onclick="updateQuantity(${item.id}, 1)" class="stepper-btn">+</button>
                        <button onclick="updateQuantity(${item.id}, -1)" class="stepper-btn">-</button>
                    </div>
                </div>
            </li>
        `;
    });

    if (totalCountBadge) {
        totalCountBadge.textContent = count;
        totalCountBadge.classList.remove("hidden");
    }
    if (totalPriceEl) totalPriceEl.textContent = `${total.toFixed(2)} ج.م`;
}

// === إرسال الفاتورة التفصيلية عبر واتساب (توجيه مباشر وحصري إلى الرقم المطلوب) ===
async function sendOrderViaWhatsApp() {
    if (cart.length === 0) return;
    
    showNotification("جاري معالجة الفاتورة التفصيلية وتوجيهك لواتساب...", "info");
    
    const user = firebase.auth().currentUser;
    const shippingAddress = user ? await API.getShippingAddress(user.email) : "عنوان غير محدد بعد";
    const userEmail = user ? user.email : "عميل غير مسجل";
    
    let originalSubtotal = 0;
    let finalTotal = 0;
    
    let textMessage = "🛍️ *فاتورة طلب جديدة - متجر Creative House* 🛍️\n\n";
    textMessage += `👤 *العميل:* ${user ? (user.displayName || "عميل المتجر") : "زائر"}\n`;
    textMessage += `📧 *البريد:* ${userEmail}\n`;
    textMessage += `📍 *العنوان:* ${shippingAddress}\n\n`;
    textMessage += "📦 *تفاصيل المشتريات:*\n";
    textMessage += "----------------------------------------\n";
    
    cart.forEach((item, index) => {
        const origPrice = item.originalPrice || item.price;
        const discountVal = origPrice - item.price;
        const totalItemPrice = item.price * item.quantity;
        
        originalSubtotal += origPrice * item.quantity;
        finalTotal += totalItemPrice;
        
        textMessage += `${index + 1}. *${item.name}*\n`;
        textMessage += `   الكمية: ${item.quantity} | السعر: ${item.price.toFixed(2)} ج.م\n`;
        if (discountVal > 0) {
            textMessage += `   خصم مالي: ${discountVal.toFixed(2)} ج.م (سعر أصلي: ${origPrice.toFixed(2)} ج.م)\n`;
        }
        textMessage += `   إجمالي البند: ${totalItemPrice.toFixed(2)} ج.م\n\n`;
    });
    
    const totalDiscounts = originalSubtotal - finalTotal;
    
    textMessage += "----------------------------------------\n";
    textMessage += `💳 *ملخص الفاتورة المعتمد:*\n`;
    textMessage += `🔸 المجموع الفرعي الأصلي: ${originalSubtotal.toFixed(2)} ج.م\n`;
    if (totalDiscounts > 0) {
        textMessage += `🔴 إجمالي الخصومات المطبقة: -${totalDiscounts.toFixed(2)} ج.م\n`;
    }
    textMessage += `🔥 *المجموع الصافي النهائي:* *${finalTotal.toFixed(2)} ج.م*\n\n`;
    textMessage += "📞 _سيقوم ممثل خدمة العملاء بالتواصل معك لتأكيد تفاصيل الشحن والرد عليك خلال 24 ساعة._";
    
    showNotification("تم استلام طلبك بنجاح! سيقوم ممثل خدمة العملاء بالتواصل معك خلال 24 ساعة.", "success");
    
    setTimeout(() => {
        // تم ربط وتوجيه الفواتير والطلبات بنجاح إلى الرقم الفعال المطلوب والمثبت
        window.open("https://wa.me/201002729426?text=" + encodeURIComponent(textMessage), "_blank");
    }, 1500);
}

function renderHomeProducts() {
    const gridPrinting = document.getElementById("grid-printing");
    const gridToys = document.getElementById("grid-toys");
    const gridColors = document.getElementById("grid-colors");
    const gridBooks = document.getElementById("grid-books");

    if (!gridPrinting || !gridToys || !gridColors || !gridBooks) return;

    gridPrinting.innerHTML = "";
    gridToys.innerHTML = "";
    gridColors.innerHTML = "";
    gridBooks.innerHTML = "";

    const categorised = { printing: [], toys: [], colors: [], books: [] };
    productsDatabase.forEach(p => {
        if (categorised[p.category]) categorised[p.category].push(p);
    });

    const sectionsConfig = [
        { key: "printing", grid: gridPrinting, parentId: "section-printing" },
        { key: "toys", grid: gridToys, parentId: "section-toys" },
        { key: "colors", grid: gridColors, parentId: "section-colors" },
        { key: "books", grid: gridBooks, parentId: "section-books" }
    ];

    sectionsConfig.forEach(config => {
        const parentSection = document.getElementById(config.parentId);
        if (!parentSection) return;

        const items = categorised[config.key];

        if (items.length === 0) {
            parentSection.classList.add("hidden");
        } else {
            parentSection.classList.remove("hidden");
            
            items.slice(0, 1).forEach(product => {
                const isSaved = wishlist.includes(product.id) ? "active" : "";
                const saveIconFill = wishlist.includes(product.id) ? "currentColor" : "none";
                const discountBadge = product.originalPrice && product.originalPrice > product.price 
                    ? `<span class="amazon-discount-badge">خصم ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>` 
                    : "";

                let starsHTML = "";
                const roundedRating = Math.round(product.rating);
                for (let i = 1; i <= 5; i++) {
                    starsHTML += (i <= roundedRating) ? "★" : "☆";
                }

                config.grid.innerHTML += `
                    <div class="product-card" onclick="window.location.href='product-details.html?id=${product.id}'">
                        ${discountBadge}
                        <button onclick="event.stopPropagation(); toggleWishlist(${product.id})" class="card-save-btn ${isSaved}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${saveIconFill}" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <div class="card-details">
                            <h4 class="product-name">${product.name}</h4>
                            <div class="product-rating">${starsHTML} <span class="text-xs text-gray-500 font-normal">(${product.reviewsCount})</span></div>
                            <div class="flex items-baseline gap-2 mt-1">
                                <p class="current-price">${product.price.toFixed(2)}</p>
                                ${product.originalPrice && product.originalPrice > product.price ? `<p class="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)} ج.م</p>` : ""}
                            </div>
                            <button onclick="event.stopPropagation(); addToCart(${product.id})" class="add-btn-dark py-2 px-3 text-xs mt-3 w-full">إضافة للسلة</button>
                        </div>
                    </div>
                `;
            });
        }
    });
}

async function renderCategoryPageProducts() {
    const grid = document.getElementById("category-products-grid");
    const titleEl = document.getElementById("category-page-title");
    if (!grid || !titleEl) return;

    const urlParams = new URLSearchParams(window.location.search);
    const categoryType = urlParams.get("type") || "printing";

    const titlesMap = {
        printing: "قسم منتجات الطباعة الاحترافية",
        toys: "قسم الألعاب الذكية والتعليمية",
        colors: "قسم الألوان وأدوات الفنون الرسم",
        books: "قسم الكتب والكراسات المدرسية"
    };

    titleEl.innerText = titlesMap[categoryType] || "تصفح التشكيلة المتاحة";

    const filtered = productsDatabase.filter(p => p.category === categoryType);
    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="p-4 text-center text-gray-500 w-full col-span-2 text-xs">لا توجد منتجات في هذا القسم حالياً.</p>`;
        return;
    }

    filtered.forEach(product => {
        const isSaved = wishlist.includes(product.id) ? "active" : "";
        const saveIconFill = wishlist.includes(product.id) ? "currentColor" : "none";
        const discountBadge = product.originalPrice && product.originalPrice > product.price 
            ? `<span class="amazon-discount-badge">خصم ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>` 
            : "";

        let starsHTML = "";
        const roundedRating = Math.round(product.rating);
        for (let i = 1; i <= 5; i++) {
            starsHTML += (i <= roundedRating) ? "★" : "☆";
        }

        grid.innerHTML += `
            <div class="product-card" onclick="window.location.href='product-details.html?id=${product.id}'">
                ${discountBadge}
                <button onclick="event.stopPropagation(); toggleWishlist(${product.id})" class="card-save-btn ${isSaved}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${saveIconFill}" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="card-details">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-rating">${starsHTML} <span class="text-xs text-gray-500 font-normal">(${product.reviewsCount})</span></div>
                    <div class="flex items-baseline gap-2 mt-1">
                        <p class="current-price">${product.price.toFixed(2)}</p>
                        ${product.originalPrice && product.originalPrice > product.price ? `<p class="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)} ج.م</p>` : ""}
                    </div>
                    <button onclick="event.stopPropagation(); addToCart(${product.id})" class="add-btn-dark py-2 px-3 text-xs mt-3 w-full">إضافة للسلة</button>
                </div>
            </div>
        `;
    });
}

async function renderProductDetailsPage() {
    const content = document.getElementById("product-details-content");
    if (!content) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = Number(urlParams.get("id"));

    const product = productsDatabase.find(p => p.id === productId);
    if (!product) {
        content.innerHTML = `<p class="text-center text-gray-500">حدث خطأ: لم يتم العثور على المنتج المطلوب.</p>`;
        return;
    }

    const isSaved = wishlist.includes(product.id) ? "active" : "";
    const saveIconFill = wishlist.includes(product.id) ? "currentColor" : "none";
    const activeUserRatingValue = userPhoneNumber ? await API.getUserRating(userPhoneNumber, product.id) : 0;

    let ratingStarsHTML = "";
    const roundedRating = Math.round(product.rating);
    for (let i = 1; i <= 5; i++) {
        ratingStarsHTML += (i <= roundedRating) ? "★" : "☆";
    }

    let inputStarsHTML = "";
    for (let i = 1; i <= 5; i++) {
        const starClass = (activeUserRatingValue >= i) ? "active" : "";
        inputStarsHTML += `
            <button onclick="submitUserRating(${product.id}, ${i})" class="interactive-star-btn ${starClass}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </button>
        `;
    }

    content.innerHTML = `
        <div class="details-image-box">
            <img src="${product.image}" alt="${product.name}" class="details-image">
        </div>
        <div class="details-info-box">
            <div class="details-title-row">
                <h1 class="details-product-title">${product.name}</h1>
                <div class="flex flex-col items-end">
                    <span class="details-price-tag">${product.price.toFixed(2)} ج.م</span>
                    ${product.originalPrice && product.originalPrice > product.price ? `<span class="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)} ج.م</span>` : ""}
                </div>
            </div>
            
            <div class="product-rating" onclick="openRatingBreakdown(${product.id})" style="cursor:pointer; display:flex; align-items:center; gap:6px;">
                <span class="text-lg font-black" style="color:var(--amazon-orange);">${ratingStarsHTML}</span>
                <span class="text-xs font-bold" style="color:var(--text-muted); text-decoration: underline;">(${product.reviewsCount} تقييم عملاء)</span>
            </div>
            
            <div class="theme-setting-row" style="background-color: var(--bg-main); border: 1px solid var(--border-color); padding: 12px; border-radius: 16px;">
                <div class="theme-text-info">
                    <span class="theme-setting-title">تقييمك الشخصي للمنتج</span>
                    <span class="theme-setting-desc">المتوسط العام للمنصة: ⭐ ${product.rating.toFixed(1)}</span>
                </div>
                <div class="interactive-stars-row">
                    ${inputStarsHTML}
                </div>
            </div>

            <p class="details-desc">${product.description}</p>

            <div class="details-action-bar">
                <button onclick="addToCart(${product.id})" class="details-add-to-cart-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-2" style="transform: translateY(-1px);">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    إضافة إلى السلة
                </button>
                <button onclick="toggleWishlist(${product.id}); renderProductDetailsPage();" class="details-favorite-btn ${isSaved}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${saveIconFill}" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

async function loginSuccess(email) {
    userPhoneNumber = email; 
    localStorage.setItem("user_phone", email);
    window.location.href = "index.html";
}

async function handleLogout() {
    firebase.auth().signOut().then(() => {
        userPhoneNumber = null;
        localStorage.removeItem("user_phone");
        window.location.href = "auth.html";
    }).catch((e) => {
        showNotification("خطأ أثناء تسجيل الخروج: " + e.message, "error");
    });
}

async function initializeApp() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const loaded = await ensureFirebaseScriptsLoaded();
    if (!loaded) {
        showNotification("تعذر تحميل ملفات التشغيل، يرجى التحقق من اتصال الإنترنت.", "error");
        return;
    }

    if (firebase.apps.length === 0) {
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log("Firebase Connected via Safe Loader.");
        } catch (e) {
            console.error("Firebase Connection Error: ", e);
        }
    } else {
        db = firebase.firestore();
    }

    if (db) {
        await checkAndSeedProducts(db);
    }
    let rawProducts = await API.getProducts();
    productsDatabase = await fetchAndApplyRealRatings(rawProducts);
    
    renderPromoBanner(); 
    renderHomeProducts();
    renderProductDetailsPage();
    renderCategoryPageProducts();
    syncLiveAnnouncement();

    if (typeof firebase !== "undefined" && firebase.apps.length > 0) {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                userPhoneNumber = user.email;
                localStorage.setItem("user_phone", user.email);

                cart = await API.getCart(user.email);
                wishlist = await API.getWishlist(user.email);

                updateCartUI();
                updateHeaderProfileUI(user);
                loadProfileData();
                renderHomeProducts();
                renderProductDetailsPage();
                renderCategoryPageProducts();

                if (window.location.pathname.includes("auth.html")) {
                    window.location.href = "index.html";
                }
            } else {
                userPhoneNumber = null;
                localStorage.removeItem("user_phone");
                updateHeaderProfileUI(null);

                if (window.location.pathname.includes("profile.html") || window.location.pathname.includes("security.html")) {
                    window.location.href = "auth.html";
                }
            }
        });
    } else {
        console.error("Firebase SDK critical load failure: cannot bind Auth state listener.");
    }
}

document.addEventListener("DOMContentLoaded", initializeApp);