document.addEventListener("DOMContentLoaded", () => {
  const cartButton = document.getElementById("cart-button");
  const cartModal = document.getElementById("cart-modal");
  const closeButton = document.querySelector(".close");
  const cartItems = document.getElementById("cart-items");
  const cartSubtotal = document.getElementById("cart-subtotal");
  const shippingFee = document.getElementById("shipping-fee");
  const discount = document.getElementById("discount");
  const cartTotal = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");
  const buyNowButton = document.querySelector(".buynow");

  if (buyNowButton) {
    buyNowButton.addEventListener("click", handleBuyNow);
  }

  let cart = [];

  let slideIndex = 0;
  showSlides();

  function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
      slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 4000);
  }

  function updateCart() {
    cartItems.innerHTML = "";
    let subtotal = 0;
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <input type="checkbox" class="cart-checkbox" data-id="${item.id}" data-price="${item.price}" data-quantity="${item.quantity}">
                ${item.name} - ₱${item.price} x ${item.quantity}
                <div class="quantity-controls">
                    <button class="decrease" data-id="${item.id}">-</button>
                    <p>${item.quantity}</p>
                    <button class="increase" data-id="${item.id}">+</button>
                    <button class="remove" data-id="${item.id}">X</button>
                </div>
            `;
      cartItems.appendChild(li);
      subtotal += item.price * item.quantity;
    });
    cartSubtotal.innerText = subtotal.toFixed(2);
    updateTotal();
    cartCount.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.querySelectorAll(".quantity-controls button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemId = e.target.dataset.id;
        const action = e.target.className;

        if (action === "decrease") {
          decreaseQuantity(itemId);
        } else if (action === "increase") {
          increaseQuantity(itemId);
        } else if (action === "remove") {
          removeFromCart(itemId);
        }
      });
    });

    document.querySelectorAll(".cart-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", updateTotal);
    });
  }

  function decreaseQuantity(itemId) {
    const item = cart.find((item) => item.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity--;
      updateCart();
      saveCartState();
    }
  }

  function increaseQuantity(itemId) {
    const item = cart.find((item) => item.id === itemId);
    if (item) {
      item.quantity++;
      updateCart();
      saveCartState();
    }
  }

  function removeFromCart(itemId) {
    cart = cart.filter((item) => item.id !== itemId);
    updateCart();
    saveCartState();
  }

  function updateTotal() {
    let subtotal = 0;
    const shipping = 100;
    const discountAmount = 50;

    document.querySelectorAll(".cart-checkbox:checked").forEach((checkbox) => {
      const itemId = checkbox.dataset.id;
      const itemPrice = parseFloat(checkbox.dataset.price);
      const itemQuantity = parseInt(checkbox.dataset.quantity);
      subtotal += itemPrice * itemQuantity;
    });

    cartSubtotal.innerText = subtotal.toFixed(2);
    shippingFee.innerText = shipping.toFixed(2);
    discount.innerText = discountAmount.toFixed(2);
    cartTotal.innerText = (subtotal + shipping - discountAmount).toFixed(2);
  }

  async function addToCart(productId, productName, productPrice) {
    try {
      const response = await fetch(`/items/${productId}`);
      const product = await response.json();

      if (product.stock > 0) {
        const existingItem = cart.find((item) => item.id === productId);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1,
          });
        }
        updateCart();
        saveCartState();
      } else {
        swal({
          title: "Out of Stock",
          text: "Sorry, this item is out of stock.",
          icon: "warning",
          button: "Okay",
        });
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  }

  function saveCartState() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function loadCartState() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCart();
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch("http://localhost:3000/items");
      const products = await response.json();
      const productsContainer = document.querySelector(".products");
      productsContainer.innerHTML = "";
      products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.className = "card";

        const stockMessage =
          product.stock > 0
            ? `Available Stocks: <span class="available-stock-text"><strong>${product.stock}</strong></span>`
            : '<span class="out-of-stock">Out of Stock</span>';

        productCard.innerHTML = `
                    <img src="${product.image}" class="product_img" alt="${
          product.name
        }">
                    <h1>${product.name}</h1>
                    <p id="stock-text">${stockMessage}</p>
                    <p id="prices">₱${product.price}</p>
                    <p>${product.description}</p>
                    <button class="add-to-cart" data-product-id="${
                      product._id
                    }" data-product-name="${
          product.name
        }" data-product-price="${product.price}" ${
          product.stock === 0 ? "disabled" : ""
        }>Add to Cart</button>
                `;
        productsContainer.appendChild(productCard);
      });

      document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = e.target.dataset.productId;
          const name = e.target.dataset.productName;
          const price = e.target.dataset.productPrice;
          addToCart(id, name, price);
        });
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  async function handleBuyNow() {
    console.log("Buy Now button clicked");

    // Get the form elements
    const form = document.getElementById("checkout-form");
    const fname = document.getElementById("fname");
    const email = document.getElementById("email");
    const adr = document.getElementById("adr");
    const city = document.getElementById("city");
    const zip = document.getElementById("zip");
    const cname = document.getElementById("cname");
    const ccnum = document.getElementById("ccnum");
    const expmonth = document.getElementById("expmonth");
    const expyear = document.getElementById("expyear");
    const cvv = document.getElementById("cvv");

    // Validate form inputs
    if (
      !fname.value.trim() ||
      !email.value.trim() ||
      !adr.value.trim() ||
      !city.value.trim() ||
      !zip.value.trim()
    ) {
      swal({
        title: "Incomplete Information",
        text: "Please fill out all required fields.",
        icon: "warning",
        button: "Okay",
      });
      return;
    }

    if (!validateEmail(email.value.trim())) {
      swal({
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        icon: "warning",
        button: "Okay",
      });
      return;
    }

    if (
      !validateCreditCard(
        ccnum.value.trim(),
        expmonth.value.trim(),
        expyear.value.trim(),
        cvv.value.trim()
      )
    ) {
      swal({
        title: "Invalid Credit Card Details",
        text: "Please enter valid credit card details.",
        icon: "warning",
        button: "Okay",
      });
      return;
    }

    const checkedCheckboxes = document.querySelectorAll(
      ".cart-checkbox:checked"
    );

    if (checkedCheckboxes.length === 0) {
      swal({
        title: "No Items Selected",
        text: "Please select at least one item to proceed with checkout.",
        icon: "warning",
        button: "Okay",
      });
      return;
    }

    const selectedItems = [];
    let stockCheck = true; // To track if all items are in stock

    for (const checkbox of checkedCheckboxes) {
      const itemId = checkbox.dataset.id;
      const itemPrice = parseFloat(checkbox.dataset.price);
      const itemQuantity = parseInt(checkbox.dataset.quantity);

      // Fetch the current stock for each item
      try {
        const response = await fetch(`/items/${itemId}`);
        const product = await response.json();

        if (product.stock < itemQuantity) {
          stockCheck = false;
          swal({
            title: "Insufficient Stock",
            text: `Only ${product.stock} of ${product.name} is available. Please adjust your quantity.`,
            icon: "warning",
            button: "Okay",
          });
          break;
        }

        selectedItems.push({
          id: itemId,
          price: itemPrice,
          quantity: itemQuantity,
        });
      } catch (error) {
        console.error("Error fetching product details:", error);
        stockCheck = false;
        swal({
          title: "Error",
          text: "An error occurred while checking stock levels.",
          icon: "error",
          button: "Okay",
        });
        break;
      }
    }

    if (!stockCheck) return;

    if (selectedItems.length > 0) {
      const totalAmount = parseFloat(cartTotal.innerText);
      console.log("Total Amount: ", totalAmount);

      const checkoutData = {
        items: selectedItems,
        totalAmount: totalAmount,
        billingInfo: {
          firstName: fname.value.trim(),
          email: email.value.trim(),
          address: adr.value.trim(),
          city: city.value.trim(),
          zip: zip.value.trim(),
          cardInfo: {
            name: cname.value.trim(),
            number: ccnum.value.trim(),
            expMonth: expmonth.value.trim(),
            expYear: expyear.value.trim(),
            cvv: cvv.value.trim(),
          },
        },
      };

      console.log("Sending checkout data:", checkoutData);

      try {
        const response = await fetch("/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkoutData),
        });

        console.log("Response status:", response.status);

        const data = await response.json();
        console.log("Response data:", data);

        if (data.success) {
          swal({
            title: "Checkout Successful",
            text: "Your order has been placed successfully.",
            icon: "success",
            button: "Okay",
          }).then(() => {
            cart = cart.filter(
              (item) =>
                !selectedItems.some(
                  (selectedItem) => selectedItem.id === item.id
                )
            );
            location.reload();
            updateCart();
            saveCartState();
          });
        } else {
          swal({
            title: "Checkout Failed",
            text: data.message || "An error occurred during checkout.",
            icon: "error",
            button: "Okay",
          });
        }
      } catch (error) {
        console.error("Error during checkout:", error);
        swal({
          title: "Error",
          text: "An error occurred. Please try again later.",
          icon: "error",
          button: "Okay",
        });
      }
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateCreditCard(number, month, year, cvv) {
    const reNumber = /^\d{16}$/;
    const reMonth = /^(0[1-9]|1[0-2])$/;
    const reYear = /^\d{4}$/;
    const reCvv = /^\d{3,4}$/;

    return (
      reNumber.test(number) &&
      reMonth.test(month) &&
      reYear.test(year) &&
      reCvv.test(cvv)
    );
  }

  loadCartState();
  fetchProducts();

  cartButton.addEventListener("click", () => {
    cartModal.style.display = "block";
  });

  closeButton.addEventListener("click", () => {
    cartModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === cartModal) {
      cartModal.style.display = "none";
    }
  });
});
