/* Coffee Nation Hisar — editable source of truth.
 *
 * INTERNAL / DEMO NOTICE — NOT FOR CUSTOMER DISPLAY
 * Menu prices below are illustrative DEMO values for this V5 preview.
 * They are NOT verified business prices. Production launch is conditional on
 * written owner approval of every price, category, description, bestseller
 * flag and business detail. See docs/OWNER-APPROVAL.md before going live.
 *
 * Public site keys are safe here. Never put API keys, email account passwords,
 * or private form-provider tokens in this file or anywhere else in public/.
 */
(function () {
  "use strict";

  var siteUrl = "https://kulana121-bit.github.io/coffee-nation-hisar/v5/"; // live /v5/ URL on GitHub Pages

  window.COFFEE_NATION = {
    meta: {
      pricingMode: "DEMO_OWNER_APPROVAL_REQUIRED",
      priceDisplay: "indicative",
      lastAudited: "2026-11-19"
    },

    site: {
      siteUrl: siteUrl,
      name: "Coffee Nation",
      localName: "Coffee Nation Hisar",
      phoneDisplay: "+91 97285 55099",
      phoneE164: "+919728555099",
      whatsappNumber: "919728555099",
      email: "coffeenationhisar@gmail.com",
      instagramUrl: "https://www.instagram.com/coffeenationofficial/",
      instagramHandle: "@coffeenationofficial",
      mapsPlaceId: "ChIJyTAz4TozEjkRh9YzoET2vck",
      mapsSearchUrl:
        "https://www.google.com/maps/search/?api=1&query=Coffee%20Nation%20Hisar&query_place_id=ChIJyTAz4TozEjkRh9YzoET2vck",
      mapsDirectionsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=Coffee%20Nation%2C%20SCO%2099%2C%20Sirsa%20Rd%2C%20PLA%2C%20Hisar%2C%20Haryana%20125001&destination_place_id=ChIJyTAz4TozEjkRh9YzoET2vck",
      mapsEmbedUrl: "https://www.google.com/maps?q=29.1445664,75.7279071&z=17&output=embed",
      address: {
        streetAddress: "Shop no. 99, First floor, SCO 99, Sirsa Rd, above Pizza Wings, PLA",
        locality: "Hisar",
        region: "Haryana",
        postalCode: "125001",
        country: "IN"
      },
      geo: { latitude: 29.1445664, longitude: 75.7279071 },
      hours: { opens: "09:00", closes: "22:00", display: "Open daily, 9 AM – 10 PM" },
      googleRating: {
        value: 4.7,
        reviewCount: 1292,
        checkedOn: "2026-11-19",
        sourceNote: "Google listing data dated 2026-11-05; figures change over time."
      }
    },

    contact: {
      endpoint: "/api/contact",
      turnstileSiteKey: "" // Optional public Cloudflare Turnstile site key.
    },

    menu: {
      categories: ["All", "Hot Coffee", "Cold Coffee", "Signature Drinks", "Tea", "Shakes", "Food & Desserts"],
      items: [
        {
          id: "cappuccino",
          name: "Cappuccino",
          category: "Hot Coffee",
          photo: "cappuccino",
          price: 149,
          ownerApprovedBestseller: false,
          description: "Espresso under steamed milk and a cap of microfoam."
        },
        {
          id: "hazelnut-cappuccino",
          name: "Hazelnut Cappuccino",
          category: "Hot Coffee",
          photo: null,
          price: 169,
          ownerApprovedBestseller: false,
          description: "The cappuccino, with hazelnut."
        },
        {
          id: "latte",
          name: "Latte",
          category: "Hot Coffee",
          photo: "latte",
          price: 159,
          ownerApprovedBestseller: false,
          description: "Espresso with more steamed milk and a thin layer of foam."
        },
        {
          id: "mocha",
          name: "Mocha",
          category: "Hot Coffee",
          photo: null,
          price: 179,
          ownerApprovedBestseller: false,
          description: "Espresso, chocolate and steamed milk."
        },
        {
          id: "double-shot-espresso",
          name: "Double Shot Espresso",
          category: "Hot Coffee",
          photo: "espresso",
          price: 119,
          ownerApprovedBestseller: false,
          description: "Two shots, short and strong."
        },
        {
          id: "cold-coffee",
          name: "Cold Coffee",
          category: "Cold Coffee",
          photo: "coldcoffee",
          price: 149,
          ownerApprovedBestseller: false,
          description: "Coffee blended cold with milk, served tall."
        },
        {
          id: "iced-coffee",
          name: "Iced Coffee",
          category: "Cold Coffee",
          photo: null,
          price: 139,
          ownerApprovedBestseller: false,
          description: "Coffee poured over ice."
        },
        {
          id: "nation-coffee",
          name: "Nation Coffee",
          category: "Signature Drinks",
          photo: null,
          price: 189,
          ownerApprovedBestseller: false,
          description: "The house signature. Ask the counter what goes in it."
        },
        {
          id: "tea-selection",
          name: "Tea selection",
          category: "Tea",
          photo: null,
          price: null,
          priceLabel: "Price to be confirmed",
          note: "Ask the counter for today's teas",
          ownerApprovedBestseller: false,
          description: "Tea selection — ask in-store"
        },
        {
          id: "shakes",
          name: "Shakes",
          category: "Shakes",
          photo: null,
          price: null,
          priceLabel: "Price to be confirmed",
          note: "Ask the counter for today's shakes",
          ownerApprovedBestseller: false,
          description: "Shakes — ask in-store"
        },
        {
          id: "white-sauce-pasta",
          name: "White Sauce Pasta",
          category: "Food & Desserts",
          photo: "pasta",
          price: 229,
          ownerApprovedBestseller: false,
          description: "Penne in a creamy white sauce."
        },
        {
          id: "grilled-sandwich",
          name: "Grilled Sandwich",
          category: "Food & Desserts",
          photo: "sandwich",
          price: 149,
          ownerApprovedBestseller: false,
          description: "Toasted on the grill and cut in half."
        },
        {
          id: "peri-peri-fries",
          name: "Peri-Peri Fries",
          category: "Food & Desserts",
          photo: "fries",
          price: 119,
          ownerApprovedBestseller: false,
          description: "Fries tossed in peri-peri seasoning."
        },
        {
          id: "brownie-with-ice-cream",
          name: "Brownie with Ice Cream",
          category: "Food & Desserts",
          photo: "brownie",
          price: 149,
          ownerApprovedBestseller: false,
          description: "A brownie with a scoop of ice cream."
        },
        {
          id: "veg-sandwich",
          name: "Veg Sandwich",
          category: "Food & Desserts",
          photo: null,
          price: 129,
          ownerApprovedBestseller: false,
          description: "A vegetable sandwich."
        }
      ]
    }
  };
})();
