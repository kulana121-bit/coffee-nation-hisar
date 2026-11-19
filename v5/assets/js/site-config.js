/* =====================================================================
   COFFEE NATION HISAR — SITE CONFIG (the one file to edit)
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
   Source: Google Business listing for Coffee Nation, Hisar
   (place_id ChIJyTAz4TozEjkRh9YzoET2vck), read on 2026-11-19, data as of 2026-11-05.
   See OWNER-APPROVAL.md for conflicts that still need the owner's answer. */
window.CN_BUSINESS = {
  name: "Coffee Nation",
  city: "Hisar",
  phoneDisplay: "+91 97285 55099",
  phoneE164: "+919728555099",
  whatsapp: "919728555099",          // wa.me number: country code + number, digits only
  email: "coffeenationhisar@gmail.com",
  instagram: "https://www.instagram.com/coffeenationofficial/",
  instagramHandle: "@coffeenationofficial",
  addressLine: "Shop no. 99, SCO 99, PLA Market, Sirsa Road, Hisar, Haryana 125001",
  floorNote: "",                     // e.g. "First floor, above Pizza Wings" — once the owner confirms
  hoursDisplay: "Open daily, 9 AM – 10 PM",
  opens: "09:00", closes: "22:00",
  lastReservation: "21:30",
  googlePlaceId: "ChIJyTAz4TozEjkRh9YzoET2vck",
  lat: 29.1445664, lng: 75.7279071,
  /* Google rating snapshot. Ratings move: refresh before launch and keep asOf honest.
     Set show:false to hide it everywhere. Never added to structured data (Google ignores
     self-published review stars for local businesses, and they go stale). */
  rating: { show: true, value: "4.7", count: "1,292", asOf: "5 Nov 2026" }
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
  { id: "hazelnut-cap", name: "Hazelnut Cappuccino",    cat: "Hot Coffee",       price: 169, priceStatus: "demo", photo: null,         bestseller: true,  desc: "The cappuccino, with hazelnut." },
  { id: "latte",        name: "Latte",                  cat: "Hot Coffee",       price: 159, priceStatus: "demo", photo: null,         bestseller: false, desc: "Espresso with more steamed milk and a thin layer of foam." },
  { id: "mocha",        name: "Mocha",                  cat: "Hot Coffee",       price: 179, priceStatus: "demo", photo: null,         bestseller: false, desc: "Espresso, chocolate and steamed milk." },
  { id: "double-esp",   name: "Double Shot Espresso",   cat: "Hot Coffee",       price: 119, priceStatus: "demo", photo: "espresso",   bestseller: false, desc: "Two shots, short and strong." },
  { id: "cold-coffee",  name: "Cold Coffee",            cat: "Cold Coffee",      price: 149, priceStatus: "demo", photo: "coldcoffee", bestseller: true,  desc: "Coffee blended cold with milk, served tall." },
  { id: "iced-coffee",  name: "Iced Coffee",            cat: "Cold Coffee",      price: 139, priceStatus: "demo", photo: null,         bestseller: false, desc: "Coffee poured over ice." },
  { id: "nation",       name: "Nation Coffee",          cat: "Signature Drinks", price: 189, priceStatus: "demo", photo: null,         bestseller: false, desc: "The house signature. Ask the counter what goes in it." },
  { id: "tea",          name: "Tea",                    cat: "Tea",              price: null, note: "Today's teas — price to be confirmed. Ask the counter or on WhatsApp." },
  { id: "shakes",       name: "Shakes",                 cat: "Shakes",           price: null, note: "Today's shakes — price to be confirmed. Ask the counter or on WhatsApp." },
  { id: "pasta",        name: "White Sauce Pasta",      cat: "Food & Desserts",  price: 229, priceStatus: "demo", photo: "pasta",      bestseller: true,  desc: "Penne in a creamy white sauce." },
  { id: "grilled-sw",   name: "Grilled Sandwich",       cat: "Food & Desserts",  price: 149, priceStatus: "demo", photo: "sandwich",   bestseller: false, desc: "Toasted on the grill and cut in half." },
  { id: "fries",        name: "Peri-Peri Fries",        cat: "Food & Desserts",  price: 119, priceStatus: "demo", photo: "fries",      bestseller: false, desc: "Fries tossed in peri-peri seasoning." },
  { id: "brownie",      name: "Brownie with Ice Cream", cat: "Food & Desserts",  price: 149, priceStatus: "demo", photo: "brownie",    bestseller: true,  desc: "A brownie with a scoop of ice cream." },
  { id: "veg-sw",       name: "Veg Sandwich",           cat: "Food & Desserts",  price: 129, priceStatus: "demo", photo: null,         bestseller: false, desc: "A vegetable sandwich." }
];
window.CN_CATEGORIES = ["All", "Hot Coffee", "Cold Coffee", "Signature Drinks", "Tea", "Shakes", "Food & Desserts"];

/* ---- Testimonials -------------------------------------------------------
   Real, permitted guest quotes only: { quote: "…", name: "…" }. Empty hides the block. */
window.CN_TESTIMONIALS = [];

/* ---- Contact form -------------------------------------------------------
   endpoint: the serverless function path. Leave as is on Vercel or Netlify.
   turnstileSiteKey: the PUBLIC Cloudflare Turnstile site key (optional).
   The secret key goes in the TURNSTILE_SECRET_KEY environment variable only. */
window.CN_FORM = {
  endpoint: "/api/contact",
  turnstileSiteKey: ""
};
