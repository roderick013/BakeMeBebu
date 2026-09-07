# Bake Me, Bebu! (bakemebebuu) 🧁✨

An authentic, fully functional online ordering e-commerce website built for **Bake Me, Bebu!** ([@bakemebebuu on Instagram](https://www.instagram.com/bakemebebuu/)), a beloved home bakery based in **Biñan, Laguna**, known for warm, homemade treats baked fresh for "Sweethearts".

> *"Where warmth and kindness bake together.."*

---

## 🌟 Key Features

1. **Authentic Brand Photography (Zero Synthetic / AI Images)**:
   - Built exclusively using authentic photos scraped directly from `@bakemebebuu`'s official Instagram feed (`images/bmb-profile.jpg`, `images/ig-post-2.jpg` through `images/ig-post-13.jpg`).
   - Features real products: Assorted Cookies Box (₱160), Classic Banana Bread (₱190), S'mores Brownies Heart Tub (₱180), Mini Bouquet Cake (₱149), Fudgy Crinkles (₱150), and Moist Chocolate Cupcakes (₱299).

2. **Real Online Ordering & Checkout Experience**:
   - **Order Bag (Shopping Cart)**: Add treats directly with 1 click, adjust quantities in real time, view subtotal and counter badge, persisted in `localStorage`.
   - **Dedicated Checkout Page (`checkout.html`)**:
     - Customer details (Name, Mobile, Email, Instagram handle).
     - Fulfillment mode toggle: Courier Delivery (+₱80 Grab/Lalamove) or Free Self-Pickup in Biñan, Laguna.
     - Scheduled delivery date & time window picker.
     - Payment options: GCash (`0976 126 9382`) or Cash on Delivery (COD) upon pickup/courier arrival.
     - Official Printable Order Slip & Order Confirmation modal.
     - 1-Click Instagram DM order syncer generating an order receipt text message.

3. **B.M.B. Reseller Program**:
   - Dedicated section on the menu showcasing reseller starter packages, profit margins, and bulk baked pastries for students and aspiring entrepreneurs.

---

## 🚀 Tech Stack

- **HTML5**: Semantic elements, accessible form labels, mobile-first meta viewport.
- **CSS3 & Tailwind CSS**:
  - **Tailwind CSS v3 (CDN)** with customized bakery design tokens:
    - Cream (`#FCF9F2`, `#F7EFE5`)
    - Blush (`#FFE4E6`, `#E07A7C`, `#C85A5C`)
    - Caramel (`#F59E0B`, `#D97706`)
    - Truffle (`#4A3528`, `#231815`)
  - **Custom CSS (`css/style.css`)**: Glassmorphic sticky navbar, subtle bakery pattern overlays, custom toast alert animations, responsive drawer panel slide transitions.
  - **Font Awesome 6.5.1 & Google Fonts** (*Playfair Display*, *Plus Jakarta Sans*, *Caveat*).
- **JavaScript & jQuery 3.7.1 (`js/main.js`)**:
  - Shopping Cart Engine with `localStorage` synchronization (`bakemebebu_cart_items`).
  - Search filter and category filtering without full page reloads.
  - Quick-view modal with quantity selection and "Add to Bag".
  - Full checkout validation, receipt generation, and Instagram DM order sync.

---

## 📂 Site Pages

1. **Home (`index.html`)**:
   - Announcement bar & glassmorphism navigation.
   - Hero banner with genuine photo showcase and quick "Order Now" action.
   - Featured treats catalog with instant "Add to Bag" buttons.
   - 3-step order flow: Choose Treats -> Place Order & Pay -> Fresh Pickup/Delivery.
   - Authentic Instagram grid from `@bakemebebuu`.
   - Customer sweet notes and testimonials.

2. **Order Menu & Reseller (`products.html`)**:
   - Full baked goods menu with prices, description, and allergen notes.
   - Live category filter tabs (All Treats, Cookies & Crinkles, Brownies & Bars, Cakes & Cupcakes, Loaves & Breads).
   - Real-time product search bar.
   - Dedicated **B.M.B. Reseller Program** package details with bulk order support.
   - Interactive Quick View modal.

3. **Our Story (`about.html`)**:
   - The origin and heartfelt journey of Bake Me, Bebu! in Biñan, Laguna.
   - Four core kitchen principles (Made with Warmth, Baked Fresh to Order, High Quality Ingredients, Community & Reseller Support).
   - Real snapshot gallery from pop-up campus events (PUP Biñan Campus) and fresh bakes.

4. **Contact & Custom Inquiries (`contact.html`)**:
   - Quick connect banner to Instagram DM (`@bakemebebuu`).
   - Direct link to instant online checkout.
   - Sweet Order Inquiry form powered by FormSubmit that forwards incoming orders directly to **`roderickorfella013@gmail.com`**.
   - Studio Hub details, direct email (`roderickorfella013@gmail.com`), operating days (Tuesday - Sunday), and FAQ accordion.

5. **Online Checkout (`checkout.html`)**:
   - Order review with real-time quantity modifiers.
   - Customer information, delivery address, target date & time slot selection.
   - Payment method selection: GCash (0976 126 9382) or Cash on Delivery (COD).
   - Generated order confirmation receipt slip with print button and Instagram DM link.

---

## 💻 How to Run

1. Simply open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox).
2. No Node.js build step or web server required — all scripts and stylesheets run cleanly in the browser.
