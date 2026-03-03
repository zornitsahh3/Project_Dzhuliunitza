const fs = require("fs");

const products = [];

const categories = ["bags", "shoes"];
const colors = ["black", "brown"];

let id = 1;

categories.forEach(category => {
  for (let i = 1; i <= 30; i++) {
    products.push({
      id: id++,
      category: category,
      name: `${category} product ${i}`,
      description: `Simple ${category} description`,
      price: 50 + i,
      discount: i % 3 === 0 ? 10 : 0,
      rating: 4.0,
      image: `images/${category}/${category}_${i}.png`,
      color: colors[i % 2],
      priceRange: "low"
    });
  }
});

fs.writeFileSync(
  "products_list.js",
  "const products = " + JSON.stringify(products, null, 2) + ";"
);

console.log("Products generated.");