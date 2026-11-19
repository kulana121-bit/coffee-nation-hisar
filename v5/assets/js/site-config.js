/* =====================================================================
   BIG MUGS HISAR — SITE CONFIG (the one file to edit)
   ---------------------------------------------------------------------
   Everything the owner may need to change lives here: business details,
   menu items and prices, approvals and form settings.
   No secrets belong in this file. It is public. API keys live only in
   the hosting provider's environment variables (see .env.example).
   ===================================================================== */

/* ---- Launch approvals ------------------------------------------------
   Every flag stays false until the owner has signed off in writing.
   `npm run prelaunch` refuses a production launch while any is false.
   They never change what customers see on their own except where noted. */
window.CN_APPROVALS = {
  prices: false,       // DEMO prices below are illustrative, not the cafe's real prices
  bestsellers: false,  // when false, no "Bestseller" labels are shown anywhere
  businessDetails: false, // address/floor, phone, email, hours confirmed by the owner
  photos: false        // owner confirms photos are of the cafe or licensed for use
};

/* ---- Business details ------------------------------------------------
   Source: Google Maps listing for Big Mugs, Hisar — live check 19 Nov 2026
   (rating 4.4 / 984 reviews; phone shown on Maps). No Google place_id on file,
   so Maps links use a name search. Photos are the previous cafe's — swap in
   Big Mugs photos when available. Prices below are DEMO/illustrative. */
window.CN_BUSINESS = {
  name: "Big Mugs",
  city: "Hisar",
  phoneDisplay: "+91 90508 88854",
  phoneE164: "+919050888854",
  whatsapp: "919050888854",          // wa.me number: country code + number, digits only
  email: "",
  instagram: "https://www.instagram.com/bigmugsindia/",
  instagramHandle: "@bigmugsindia",
  addressLine: "DSS-24-25, PLA Shopping Complex, behind Indian Petroleum Pump, Hisar, Haryana 125001",
  floorNote: "",                     // e.g. "First floor" — once the owner confirms
  hoursDisplay: "Open daily, 10 AM – 10 PM",
  opens: "10:00", closes: "22:00",
  lastReservation: "21:30",
  googlePlaceId: "",
  lat: 29.1435919, lng: 75.7289797,
  /* Google rating snapshot. Ratings move: refresh before launch and keep asOf honest.
     Set show:false to hide it everywhere. Never added to structured data (Google ignores
     self-published review stars for local businesses, and they go stale). */
  rating: { show: true, value: "4.4", count: "984", asOf: "19 Nov 2026" }
};

/* ---- Menu --------------------------------------------------------------
   price: a whole number in rupees, or null for "price to be confirmed".
   priceStatus: "demo" = illustrative sample price (needs owner approval)
                "confirmed" = owner-approved real price
   photo: key of a spotlight photo (see PHOTOS in app.js), or null.
   bestseller: shown only when CN_APPROVALS.bestsellers is true.
   Items with `note` are information rows (no price, not orderable). */
window.CN_MENU = [
  { id: "cappuccino",   name: "Cappuccino",             cat: "Hot Coffee",       price: 149, priceStatus: "demo", photo: "cappuccino", bestseller: true,  desc: "Espresso under steamed milk and a cap of microfoam." },
  { id: "hot-choc",     name: "Hot Chocolate",          cat: "Hot Coffee",       price: 159, priceStatus: "demo", photo: null,         bestseller: false, desc: "Rich, warm, and made for slow evenings." },
  { id: "double-esp",   name: "Double Shot Espresso",   cat: "Hot Coffee",       price: 119, priceStatus: "demo", photo: "espresso",   bestseller: false, desc: "Two shots, short and strong." },
  { id: "latte",        name: "Latte",                  cat: "Hot Coffee",       price: 159, priceStatus: "demo", photo: null,         bestseller: false, desc: "Espresso with more steamed milk and a thin layer of foam." },
  { id: "cold-coffee",  name: "Cold Coffee",            cat: "Cold Coffee",      price: 149, priceStatus: "demo", photo: null,         bestseller: false, desc: "Coffee blended cold with milk, served tall." },
  { id: "iced-coffee",  name: "Iced Coffee",            cat: "Cold Coffee",      price: 139, priceStatus: "demo", photo: null,         bestseller: false, desc: "Coffee poured over ice." },
  { id: "kitkat-shake", name: "Kitkat Shake",           cat: "Shakes",           price: 189, priceStatus: "demo", photo: "coldcoffee", bestseller: true,  desc: "Chocolate, crunch, and a tall cold glass." },
  { id: "tea",          name: "Tea",                    cat: "Tea",              price: null, note: "Today's teas — price to be confirmed. Ask the counter or on WhatsApp." },
  { id: "arrabbiata",   name: "Arrabbiata Pasta",       cat: "Food & Desserts",  price: 229, priceStatus: "demo", photo: "pasta",      bestseller: true,  desc: "Spicy tomato, tossed fresh to order." },
  { id: "aglio-olio",   name: "Aglio Olio",             cat: "Food & Desserts",  price: 219, priceStatus: "demo", photo: null,         bestseller: false, desc: "Garlic, olive oil, and a gentle chilli kick." },
  { id: "paneer-stick", name: "Paneer Stick with Mushroom", cat: "Food & Desserts", price: 179, priceStatus: "demo", photo: null,    bestseller: false, desc: "Crisp outside, soft inside." },
  { id: "grilled-sw",   name: "Grilled Sandwich",       cat: "Food & Desserts",  price: 149, priceStatus: "demo", photo: "sandwich",   bestseller: false, desc: "Toasted on the grill and cut in half." },
  { id: "fries",        name: "Peri-Peri Fries",        cat: "Food & Desserts",  price: 119, priceStatus: "demo", photo: "fries",      bestseller: false, desc: "Fries tossed in peri-peri seasoning." },
  { id: "brownie",      name: "Brownie with Ice Cream", cat: "Food & Desserts",  price: 149, priceStatus: "demo", photo: "brownie",    bestseller: true,  desc: "A brownie with a scoop of ice cream." },
  { id: "veg-sw",       name: "Veg Sandwich",           cat: "Food & Desserts",  price: 129, priceStatus: "demo", photo: null,         bestseller: false, desc: "A vegetable sandwich." }
];
window.CN_CATEGORIES = ["All", "Hot Coffee", "Cold Coffee", "Shakes", "Food & Desserts", "Tea"];

/* ---- Testimonials -------------------------------------------------------
   Real, permitted guest quotes only: { quote: "…", name: "…" }. Empty hides the block. */
window.CN_TESTIMONIALS = [
  { quote: "One of the best food ever had", name: "Twilight Perk" },
  { quote: "Atmosphere is chill and cool and the staff is also really friendly.", name: "Riddhi Agarwal" },
  { quote: "So Big mugs had relaunched their outlet with the mesmerizing interiors and the food is now more tastier than before.", name: "Pooja Dhingra" }
];

/* ---- Contact form -------------------------------------------------------
   endpoint: the serverless function path. Leave as is on Vercel or Netlify.
   turnstileSiteKey: the PUBLIC Cloudflare Turnstile site key (optional).
   The secret key goes in the TURNSTILE_SECRET_KEY environment variable only. */
window.CN_FORM = {
  endpoint: "/api/contact",
  turnstileSiteKey: ""
};
