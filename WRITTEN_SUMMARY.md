# Product Listing Page 💳🛒

# Summary 

Develop a Product Listing Page (PLP) like what you would see in a standard e-commerce store. The PLP
should display a collection of products that appear after a user selects a specific category, showing all
items assigned to that category. 

The objective is to present customers with a clear, structured list of products including key information
such as product name, thumbnail image, price, and other essential details, enabling them to easily
compare options and make informed purchasing decisions.

The task should focus solely on the front-end implementation; hosting the application on a server is not
required. For demonstration purposes, you may use a sample data structure of your choice (e.g., JSON).

# General Requirements

Front-End Focus Only:

- The task should focus entirely on the front-end implementation.
- There is no need to host or deploy the application on a server.
- You may use any data structure (e.g., JSON) to define sample data.
- There are no restrictions on the core web technologies used.
- You may use any JavaScript library or framework (e.g., React.js).
- You may also use CSS frameworks such as Bootstrap, if desired.
- However, you must not use pre-built HTML templates, e-commerce modules, or full e-
commerce frameworks/platforms.
- The page must be fully responsive.
- It should function and display properly on both desktop and mobile devices.

## 1. General Solution Overview
The project delivers a **front-end-only Product Listing Page** for a fashion e-commerce store (Bags & Shoes), meeting the required sections and behaviour.

- **Sticky header** with logo, store name (“The Fashion Store”), and a **navigation menu** with two categories (Bags, Shoes). Clicking a category loads the corresponding products; Bags is loaded by default.
- **Left-hand filter sidebar** with:
  - **Color** (checkboxes: Black, Brown)
  - **Price range** (Low, Medium, High)
  - **Other** (Discounted Only)
  - An “Apply” button that runs the filters.
- **Main content area** with:
  - **Category title and short description** for the active category.
  - **Sort dropdown** above the grid: Default, Alphabetical (A–Z), Alphabetical (Z–A), Price (Low to High), Price (High to Low).
  - **Product counter** in the form “x out of y products displayed.”
  - **Product grid** (4 columns on desktop) with product cards showing: image, name, short description, color, price (with discounted price and badge where applicable), star rating, and “Add to Cart” (shows a success alert on click).
- **Load More** button that reveals 20 more products per click; the grid is limited to 5 rows (20 items) on first load. The button hides when all products are shown.
- **Footer** with links: Contact Us, Privacy Policy, Terms of Service.
- **Responsive layout**: the page adapts for desktop, tablet, and mobile (e.g. grid goes to 2 columns, then 1 column on small screens; filter and layout stack appropriately).

Sample data is a JavaScript array of product objects (in `products_list.js`) with fields such as category, name, description, price, discount, rating, image URL, and color, so that filtering, sorting, and display can all be demonstrated without a backend.

---

## 2. Technologies used

- **HTML5** – Structure (header, main, sidebar, product grid, footer).
- **CSS3** – Styling and layout: Flexbox, CSS Grid, custom properties (variables), and media queries for responsiveness. No CSS frameworks; all styles are custom.
- **JavaScript (vanilla)** – All behaviour: category switching, filtering, sorting, rendering the product grid, Load More, and Add to Cart alert. No front-end frameworks.
- **Sample data** – A JavaScript array in `products_list.js` (effectively a JSON-like structure) loaded via a script tag. Some product images use local paths; many use **Unsplash** (https://images.unsplash.com) for direct image URLs.
- **Node.js** – Used only as a one-off tool to generate or extend the product list (e.g. to produce a larger dataset). The app itself does not depend on Node; it runs in the browser by opening `home.html` or serving the folder statically.

---

## 3. How the solution was achieved

**Structure**

- **home.html** – Single page: header (logo, title, category nav), main (layout wrapper, sidebar, products area), footer. Scripts load `products_list.js` (data) then `main.js` (logic).
- **style.css** – Global and layout styles, component styles (cards, buttons, filter, sort dropdown), and responsive rules at 768px and 480px.
- **main.js** – Holds the main logic: current category and pagination index, filter state, category metadata, and functions for `showCategory`, `renderProducts`, `loadMore`, `applyFilters`, and `addToCart`. The sort dropdown’s `change` event re-renders with the selected sort. Products are filtered by category, then (optionally) by color, price range, and discount; then sorted; then sliced for the current “page” (20 items) and rendered as HTML. The product counter and Load More visibility are updated on each render.
- **products_list.js** – Defines the `products` array consumed by `main.js`.

**Design choices**

- Category navigation lives in the header so it is always visible (sticky) and matches the requirement for a header with at least two categories.
- Filtering is applied on “Apply” (not live) to keep the logic simple and avoid constant re-renders while the user selects options.
- Initial load shows 20 products (5 rows × 4 columns); Load More adds 20 each time, and the button is hidden when the full list is displayed.
- Layout uses a flex container for header and for main (sidebar + products area); the product grid uses CSS Grid. Responsiveness is done by changing grid columns and stacking the layout in media queries.

---

## 4. Challenges encountered during development

- **Product list and images**  
  The first idea was to build the product list manually and use locally prepared images. That became impractical for a large number of products. The approach was changed to a more automated one: a Node.js script was used to generate the product list. The source code of that generator is `generate_products_list.js`. For images, different options were considered (e.g. random image APIs). In the end, **Unsplash** (https://images.unsplash.com) was used so that product images could be referenced by URL without storing image files in the project, while still having realistic thumbnails for bags and shoes.

- **Responsiveness on mobile**  
  Making the page work well on small screens took noticeable effort. Issues included the product grid (fixed 4 columns and image sizes) and the sidebar/layout on narrow viewports. This was addressed with media queries: at 768px the layout stacks (sidebar above products, grid to 2 columns, flexible images), and at 480px the grid becomes a single column. Tweaks to spacing and image sizing (e.g. max-width and aspect-ratio) were needed so that content did not overflow and remained readable on phones.

