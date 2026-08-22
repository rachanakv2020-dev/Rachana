// Fixed catalog of vegetables. Prices are fixed (per kg, in INR) as requested.
// In a production app this would live in a real database.

const categories = [
  { id: "leafy", name: "Leafy Greens", emoji: "🥬" },
  { id: "root", name: "Root Vegetables", emoji: "🥕" },
  { id: "gourd", name: "Gourds & Squash", emoji: "🎃" },
  { id: "nightshade", name: "Nightshades", emoji: "🍆" },
  { id: "allium", name: "Onion Family", emoji: "🧅" },
  { id: "pod", name: "Pods & Beans", emoji: "🫛" },
];

const vegetables = [
  { id: 1, name: "Spinach", category: "leafy", price: 30, unit: "kg", stock: 40, tag: "Fresh cut today", image: "🥬" },
  { id: 2, name: "Kale", category: "leafy", price: 60, unit: "kg", stock: 25, tag: "Farm favorite", image: "🥬" },
  { id: 3, name: "Lettuce", category: "leafy", price: 45, unit: "kg", stock: 30, tag: "Crisp & crunchy", image: "🥬" },
  { id: 4, name: "Fenugreek (Methi)", category: "leafy", price: 25, unit: "kg", stock: 35, tag: "", image: "🌿" },

  { id: 5, name: "Carrot", category: "root", price: 40, unit: "kg", stock: 60, tag: "Sweet & crunchy", image: "🥕" },
  { id: 6, name: "Potato", category: "root", price: 25, unit: "kg", stock: 100, tag: "Best seller", image: "🥔" },
  { id: 7, name: "Beetroot", category: "root", price: 35, unit: "kg", stock: 45, tag: "", image: "🥔" },
  { id: 8, name: "Radish", category: "root", price: 20, unit: "kg", stock: 50, tag: "", image: "🥕" },

  { id: 9, name: "Pumpkin", category: "gourd", price: 30, unit: "kg", stock: 20, tag: "", image: "🎃" },
  { id: 10, name: "Bottle Gourd", category: "gourd", price: 28, unit: "kg", stock: 22, tag: "", image: "🥒" },
  { id: 11, name: "Cucumber", category: "gourd", price: 32, unit: "kg", stock: 55, tag: "Hydrating", image: "🥒" },
  { id: 12, name: "Bitter Gourd", category: "gourd", price: 38, unit: "kg", stock: 18, tag: "", image: "🥒" },

  { id: 13, name: "Tomato", category: "nightshade", price: 35, unit: "kg", stock: 70, tag: "Vine ripened", image: "🍅" },
  { id: 14, name: "Brinjal (Eggplant)", category: "nightshade", price: 30, unit: "kg", stock: 40, tag: "", image: "🍆" },
  { id: 15, name: "Bell Pepper", category: "nightshade", price: 70, unit: "kg", stock: 28, tag: "Rainbow mix", image: "🫑" },
  { id: 16, name: "Chili Pepper", category: "nightshade", price: 55, unit: "kg", stock: 20, tag: "Spicy", image: "🌶️" },

  { id: 17, name: "Onion", category: "allium", price: 28, unit: "kg", stock: 90, tag: "Kitchen staple", image: "🧅" },
  { id: 18, name: "Garlic", category: "allium", price: 120, unit: "kg", stock: 30, tag: "", image: "🧄" },
  { id: 19, name: "Spring Onion", category: "allium", price: 22, unit: "bunch", stock: 40, tag: "", image: "🧅" },

  { id: 20, name: "Green Beans", category: "pod", price: 45, unit: "kg", stock: 33, tag: "", image: "🫛" },
  { id: 21, name: "Green Peas", category: "pod", price: 50, unit: "kg", stock: 27, tag: "Sweet & tender", image: "🫛" },
  { id: 22, name: "Okra (Ladyfinger)", category: "pod", price: 40, unit: "kg", stock: 24, tag: "", image: "🫛" },
];

module.exports = { categories, vegetables };
