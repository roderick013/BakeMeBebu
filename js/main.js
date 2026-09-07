/**
 * Bake Me, Bebu! (@bakemebebuu) - Main JavaScript & E-Commerce Script
 * Complete online ordering system:
 * - Shopping Cart (Add, remove, update quantities, special notes)
 * - Real-time Cart Drawer with Subtotal and Instant Checkout
 * - Product Catalog Filter & Search
 * - Product Quick View Modal with Add to Cart & Buy Now
 * - Checkout System with Delivery/Pickup, GCash / Cash on Delivery (COD) Payment & Order Confirmation Receipt
 * - Direct Instagram DM Order Sync
 */

$(document).ready(function () {
  'use strict';

  /* ==========================================
     1. SHOPPING CART DATA MANAGEMENT
     ========================================== */
  const CART_STORAGE_KEY = 'bakemebebu_cart_items';
  const ORDERS_STORAGE_KEY = 'bakemebebu_orders_history';

  function getCartItems() {
    try {
      const items = localStorage.getItem(CART_STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCartItems(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('LocalStorage error', e);
    }
    updateCartUI();
  }

  function addToCart(product, openDrawer = true) {
    const items = getCartItems();
    const existingIndex = items.findIndex((item) => item.id === product.id && item.notes === (product.notes || ''));

    if (existingIndex > -1) {
      items[existingIndex].quantity += product.quantity || 1;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        category: product.category,
        notes: product.notes || '',
        quantity: product.quantity || 1,
      });
    }

    saveCartItems(items);
    showToast(`Added ${product.quantity || 1}x "${product.name}" to your order bag! 🛍️`);
    pulseCartIcon();

    if (openDrawer) {
      openCartDrawer();
    }
  }

  function removeFromCart(index) {
    const items = getCartItems();
    if (index >= 0 && index < items.length) {
      const removed = items.splice(index, 1);
      saveCartItems(items);
      showToast(`Removed "${removed[0].name}" from your bag.`);
    }
  }

  function updateQuantity(index, delta) {
    const items = getCartItems();
    if (items[index]) {
      items[index].quantity += delta;
      if (items[index].quantity <= 0) {
        items.splice(index, 1);
      }
      saveCartItems(items);
    }
  }

  function calculateCartTotals() {
    const items = getCartItems();
    const count = items.reduce((sum, it) => sum + it.quantity, 0);
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const total = subtotal;
    return { count, subtotal, total };
  }

  function updateCartUI() {
    const { count, subtotal, total } = calculateCartTotals();
    const items = getCartItems();

    // Badges update
    $('.cart-count-badge, .inquiry-count-badge').text(count);
    if (count > 0) {
      $('.cart-count-badge, .inquiry-count-badge').removeClass('hidden').show();
    } else {
      $('.cart-count-badge, .inquiry-count-badge').hide();
    }

    // Render Drawer List
    const $container = $('#cart-drawer-items, #inquiry-drawer-items');
    if ($container.length) {
      if (items.length === 0) {
        $container.html(`
          <div class="text-center py-12 text-stone-500">
            <div class="w-16 h-16 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 text-2xl">
              <i class="fa-solid fa-cookie-bite"></i>
            </div>
            <p class="font-bold text-stone-800 text-base">Your order bag is empty</p>
            <p class="text-xs text-stone-500 mt-1">Pick your favorite cookies, banana bread, or cupcakes to begin!</p>
            <a href="products.html" class="inline-block mt-4 px-6 py-2.5 rounded-full bg-[#4A3528] text-white text-xs font-bold hover:bg-stone-800 transition shadow">
              Browse Menu
            </a>
          </div>
        `);
        $('#cart-drawer-subtotal, #inquiry-drawer-total').text('₱0.00');
        $('#btn-proceed-to-checkout, #checkout-inquiry-btn').addClass('opacity-50 pointer-events-none');
      } else {
        let html = '';
        items.forEach((item, idx) => {
          html += `
            <div class="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200/80 shadow-sm">
              <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-stone-100" />
              <div class="flex-grow min-w-0">
                <h4 class="font-bold text-stone-900 text-xs sm:text-sm truncate">${item.name}</h4>
                ${item.notes ? `<p class="text-[11px] text-rose-600 font-medium truncate">Note: ${item.notes}</p>` : ''}
                <p class="text-xs text-stone-500 font-medium">₱${item.price.toFixed(2)} each</p>
                <div class="flex items-center gap-2 mt-2">
                  <button type="button" class="btn-qty-minus w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center" data-index="${idx}">-</button>
                  <span class="text-xs font-bold text-stone-800 w-5 text-center">${item.quantity}</span>
                  <button type="button" class="btn-qty-plus w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center" data-index="${idx}">+</button>
                </div>
              </div>
              <div class="text-right flex flex-col justify-between items-end h-16">
                <button type="button" class="btn-remove-item text-stone-400 hover:text-rose-500 transition text-sm p-1" data-index="${idx}" title="Remove">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
                <span class="font-bold text-stone-900 text-sm">₱${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          `;
        });
        $container.html(html);
        $('#cart-drawer-subtotal, #inquiry-drawer-total').text('₱' + total.toFixed(2));
        $('#btn-proceed-to-checkout, #checkout-inquiry-btn').removeClass('opacity-50 pointer-events-none');
      }
    }

    // Update Checkout Page if currently on checkout.html
    if ($('#checkout-items-list').length) {
      renderCheckoutReview();
    }
  }

  function pulseCartIcon() {
    $('.cart-btn-trigger, .inquiry-btn-trigger').addClass('scale-125 transition-transform');
    setTimeout(() => {
      $('.cart-btn-trigger, .inquiry-btn-trigger').removeClass('scale-125');
    }, 200);
  }

  // Event handlers for quantity & removal
  $(document).on('click', '.btn-qty-minus', function () {
    const idx = $(this).data('index');
    updateQuantity(idx, -1);
  });

  $(document).on('click', '.btn-qty-plus', function () {
    const idx = $(this).data('index');
    updateQuantity(idx, 1);
  });

  $(document).on('click', '.btn-remove-item', function () {
    const idx = $(this).data('index');
    removeFromCart(idx);
  });

  /* ==========================================
     2. CART DRAWER TOGGLE
     ========================================== */
  function openCartDrawer() {
    $('#cart-drawer-overlay, #inquiry-drawer-overlay').fadeIn(200);
    $('#cart-drawer-panel, #inquiry-drawer-panel').removeClass('translate-x-full');
    $('body').addClass('overflow-hidden');
  }

  function closeCartDrawer() {
    $('#cart-drawer-panel, #inquiry-drawer-panel').addClass('translate-x-full');
    $('#cart-drawer-overlay, #inquiry-drawer-overlay').fadeOut(200);
    $('body').removeClass('overflow-hidden');
  }

  $('.cart-btn-trigger, .inquiry-btn-trigger').on('click', function (e) {
    e.preventDefault();
    openCartDrawer();
  });

  $('#close-cart-drawer, #cart-drawer-overlay, #close-inquiry-drawer, #inquiry-drawer-overlay').on('click', function () {
    closeCartDrawer();
  });

  $('#btn-proceed-to-checkout, #checkout-inquiry-btn').on('click', function () {
    closeCartDrawer();
    window.location.href = 'checkout.html';
  });

  /* ==========================================
     3. NAVBAR & MOBILE MENU
     ========================================== */
  $('#mobile-menu-btn').on('click', function () {
    const $menu = $('#mobile-nav-menu');
    $menu.slideToggle(250);
    const expanded = $(this).attr('aria-expanded') === 'true' || false;
    $(this).attr('aria-expanded', !expanded);
    $(this).find('i').toggleClass('fa-bars fa-xmark');
  });

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 30) {
      $('#site-navbar').addClass('shadow-md bg-[#FCF9F2]/95').removeClass('bg-[#FCF9F2]/85');
    } else {
      $('#site-navbar').removeClass('shadow-md bg-[#FCF9F2]/95').addClass('bg-[#FCF9F2]/85');
    }
  });

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  $('.nav-link').each(function () {
    const linkHref = $(this).attr('href');
    if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
      $(this).addClass('text-[#E07A7C] font-semibold border-b-2 border-[#E07A7C]').removeClass('text-stone-700');
    }
  });

  /* ==========================================
     5. TOAST NOTIFICATIONS
     ========================================== */
  function showToast(message) {
    let $toast = $('#toast-notification');
    if (!$toast.length) {
      $toast = $(`
        <div id="toast-notification" class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-stone-700 max-w-sm">
          <div class="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-heart"></i>
          </div>
          <p id="toast-msg-text" class="text-xs sm:text-sm font-medium leading-snug"></p>
        </div>
      `).appendTo('body');
    }

    $('#toast-msg-text').text(message);
    $toast.addClass('show');

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      $toast.removeClass('show');
    }, 3500);
  }

  /* ==========================================
     6. PRODUCT CATALOG: FILTERING & SEARCH
     ========================================== */
  $('.filter-btn').on('click', function () {
    $('.filter-btn').removeClass('active bg-[#4A3528] text-white').addClass('bg-white text-stone-700');
    $(this).addClass('active bg-[#4A3528] text-white').removeClass('bg-white text-stone-700');

    const filterCategory = $(this).data('filter');
    filterProducts(filterCategory, $('#product-search-input').val());
  });

  $('#product-search-input').on('keyup', function () {
    const activeCategory = $('.filter-btn.active').data('filter') || 'all';
    filterProducts(activeCategory, $(this).val());
  });

  function filterProducts(category, query) {
    const q = (query || '').toLowerCase().trim();
    let visibleCount = 0;

    $('.product-item-card').each(function () {
      const itemCat = $(this).data('category');
      const itemTitle = $(this).find('.product-title').text().toLowerCase();
      const itemDesc = $(this).find('.product-description').text().toLowerCase();

      const matchesCat = category === 'all' || itemCat === category;
      const matchesQuery = !q || itemTitle.includes(q) || itemDesc.includes(q);

      if (matchesCat && matchesQuery) {
        $(this).fadeIn(200);
        visibleCount++;
      } else {
        $(this).fadeOut(150);
      }
    });

    if (visibleCount === 0) {
      $('#no-products-found').removeClass('hidden').fadeIn(200);
    } else {
      $('#no-products-found').addClass('hidden').hide();
    }
  }

  $('#sort-select').on('change', function () {
    const sortVal = $(this).val();
    const $grid = $('#products-grid');
    const $items = $('.product-item-card').get();

    $items.sort(function (a, b) {
      const priceA = parseFloat($(a).data('price')) || 0;
      const priceB = parseFloat($(b).data('price')) || 0;
      const nameA = $(a).find('.product-title').text();
      const nameB = $(b).find('.product-title').text();

      if (sortVal === 'price-asc') return priceA - priceB;
      if (sortVal === 'price-desc') return priceB - priceA;
      if (sortVal === 'name-asc') return nameA.localeCompare(nameB);
      return 0;
    });

    $.each($items, function (idx, itm) {
      $grid.append(itm);
    });
  });

  // "Add to Cart" directly from card button
  $(document).on('click', '.btn-add-inquiry, .btn-add-to-cart', function (e) {
    e.preventDefault();
    const $card = $(this).closest('.product-item-card');
    const product = {
      id: $card.data('id') || 'item-' + Date.now(),
      name: $card.find('.product-title').text().trim(),
      price: $card.data('price'),
      image: $card.find('img').attr('src'),
      category: $card.data('category'),
      quantity: 1,
    };
    addToCart(product, true);
  });

  // "Instant Buy Now" from card / modal
  $(document).on('click', '.btn-buy-now', function (e) {
    e.preventDefault();
    const $card = $(this).closest('.product-item-card');
    const product = {
      id: $card.data('id') || 'item-' + Date.now(),
      name: $card.find('.product-title').text().trim(),
      price: $card.data('price'),
      image: $card.find('img').attr('src'),
      category: $card.data('category'),
      quantity: 1,
    };
    addToCart(product, false);
    window.location.href = 'checkout.html';
  });

  /* ==========================================
     7. PRODUCT QUICK VIEW MODAL
     ========================================== */
  $(document).on('click', '.btn-quick-view', function (e) {
    e.preventDefault();
    const $card = $(this).closest('.product-item-card');
    const title = $card.find('.product-title').text().trim();
    const price = $card.data('price');
    const image = $card.find('img').attr('src');
    const category = $card.data('category');
    const desc = $card.data('full-desc') || $card.find('.product-description').text().trim();
    const ingredients = $card.data('ingredients') || 'Pure Butter, High Quality Cocoa/Chocolate, Flour, Eggs, Sugar';
    const allergens = $card.data('allergens') || 'Contains Dairy, Eggs, Gluten';

    $('#modal-product-title').text(title);
    $('#modal-product-price').text('₱' + parseFloat(price).toFixed(2));
    $('#modal-product-image').attr('src', image);
    $('#modal-product-desc').text(desc);
    $('#modal-product-ingredients').text(ingredients);
    $('#modal-product-allergens').text(allergens);
    $('#modal-product-category').text(category.toUpperCase());

    $('#modal-add-btn').data('product', {
      id: $card.data('id'),
      name: title,
      price: price,
      image: image,
      category: category,
    });

    $('#quick-view-modal').fadeIn(250).removeClass('hidden');
    $('body').addClass('overflow-hidden');
  });

  $('#close-quick-view, #quick-view-modal-backdrop').on('click', function () {
    $('#quick-view-modal').fadeOut(200);
    $('body').removeClass('overflow-hidden');
  });

  $('#modal-add-btn').on('click', function () {
    const product = $(this).data('product');
    const qty = parseInt($('#modal-product-qty').val(), 10) || 1;
    product.quantity = qty;
    addToCart(product, true);
    $('#quick-view-modal').fadeOut(200);
    $('body').removeClass('overflow-hidden');
  });

  /* ==========================================
     8. FAQ ACCORDION (Contact / Checkout)
     ========================================== */
  $(document).on('click', '.faq-question-btn', function () {
    const $answer = $(this).next('.faq-answer');
    const $icon = $(this).find('.faq-chevron');
    const isOpen = $answer.is(':visible');

    $('.faq-answer').slideUp(200);
    $('.faq-chevron').removeClass('rotate-180 text-rose-500');

    if (!isOpen) {
      $answer.slideDown(250);
      $icon.addClass('rotate-180 text-rose-500');
    }
  });

  /* ==========================================
     8.5. CONTACT & CUSTOM INQUIRY FORM
     ========================================== */
  // Auto-sync cart items to contact form if present
  if ($('#contact-prefilled-treats').length) {
    const currentItems = getCartItems();
    if (currentItems.length > 0 && !$('#contact-prefilled-treats').val().trim()) {
      const summaryText = currentItems.map(it => `• ${it.quantity}x ${it.name} (₱${it.price.toFixed(2)})`).join('\n');
      const { subtotal } = calculateCartTotals();
      $('#contact-prefilled-treats').val(
        `Selected Treats from Bag:\n${summaryText}\nEstimated Subtotal: ₱${subtotal.toFixed(2)}`
      );
    }

    // Inform user if opened as a raw file:// instead of a web server
    if (window.location.protocol === 'file:') {
      $('#contact-inquiry-form').prepend(`
        <div id="local-file-notice" class="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-amber-500 text-base mt-0.5 flex-shrink-0"></i>
          <div>
            <strong class="block font-bold">Testing from Local File (file://) Detected</strong>
            <p class="mt-0.5 text-stone-600">
              FormSubmit requires a local server or web host to send real emails to <strong>roderickorfella013@gmail.com</strong>.
              Run <code class="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-900 font-bold">start-preview.bat</code> in the project folder to open as <code class="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-900">http://localhost:8000</code>!
            </p>
          </div>
        </div>
      `);
    }
  }

  // Handle Contact / Custom Inquiry Form Submission (Sending to roderickorfella013@gmail.com)
  $('#contact-inquiry-form').on('submit', function (e) {
    e.preventDefault();

    const $form = $(this);
    const $btn = $('#btn-submit-contact');
    const $btnIcon = $('#btn-submit-icon');
    const $btnLabel = $('#btn-submit-label');

    const name = $('#contact-name').val().trim();
    const phone = $('#contact-phone').val().trim();
    const email = $('#contact-email').val().trim();
    const date = $('#contact-date').val();
    const eventType = $('#contact-event-type').val();
    const deliveryMethod = $('#contact-delivery-method').val();
    const prefilledTreats = $('#contact-prefilled-treats').val().trim();
    const message = $('#contact-message').val().trim();

    if (!name || !phone || !date || !eventType) {
      showToast('Please fill out all required fields (*)');
      return;
    }

    const refNum = 'INQ-' + Math.floor(100000 + Math.random() * 900000);
    $('#formsubmit-ref').val(refNum);
    $('#formsubmit-subject').val(`🧁 [Bake Me, Bebu!] Inquiry ${refNum} from ${name}`);

    // Update button to sending state
    $btn.prop('disabled', true).addClass('opacity-75 cursor-not-allowed');
    $btnIcon.removeClass('fa-paper-plane').addClass('fa-spinner fa-spin');
    $btnLabel.text('Sending to roderickorfella013@gmail.com...');

    const payload = {
      _subject: `🧁 [Bake Me, Bebu!] New Inquiry #${refNum} - ${name}`,
      _template: 'table',
      _captcha: 'false',
      'Inquiry Reference': refNum,
      'Customer Name': name,
      'Contact / Mobile / IG': phone,
      'Customer Email': email || 'Not provided',
      'Target Date': date,
      'Inquiry Type': eventType,
      'Delivery / Pickup Mode': deliveryMethod || 'Biñan Hub Pickup',
      'Selected Treats': prefilledTreats || 'None specified',
      'Additional Message': message || 'No extra notes'
    };

    fetch('https://formsubmit.co/ajax/roderickorfella013@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        // Reset button state
        $btn.prop('disabled', false).removeClass('opacity-75 cursor-not-allowed');
        $btnIcon.removeClass('fa-spinner fa-spin').addClass('fa-paper-plane');
        $btnLabel.text('Send Inquiry to roderickorfella013@gmail.com');

        // Check if FormSubmit reported an error or activation needed
        if (data.success === "false" || data.success === false) {
          const msg = (data.message || '').toLowerCase();
          if (msg.includes('activation') || msg.includes('activate')) {
            alert(
              "🧁 Action Required: FormSubmit Activation!\n\n" +
              "FormSubmit has sent a one-time activation email to roderickorfella013@gmail.com.\n\n" +
              "Please open your Gmail inbox (check Spam/Junk if needed) and click the 'Activate Form' button.\n" +
              "Once activated, all future inquiries will arrive directly in your inbox!"
            );
            showToast('Please check roderickorfella013@gmail.com to activate form');
            return;
          }

          if (msg.includes('web server')) {
            alert(
              "⚠️ FormSubmit requires a local web server!\n\n" +
              "FormSubmit does not accept emails sent from raw files (file:///path).\n\n" +
              "How to fix:\n" +
              "1. Double-click 'start-preview.bat' in your BakeMeBebu folder.\n" +
              "2. It will open http://localhost:8000/contact.html.\n" +
              "3. Submit the form again and your email will be delivered!"
            );
            showToast('Run start-preview.bat to test emails locally');
            return;
          }

          showToast(data.message || 'Submission error. Please check details.');
          return;
        }

        // Populate modal on confirmed success
        $('#success-order-ref').text(refNum);
        $('#success-client-contact').text(phone);
        $('#send-ig-dm-btn').attr('href', 'https://ig.me/m/bakemebebuu');

        // Reset form
        $form[0].reset();

        // Show success modal
        $('#inquiry-success-modal').fadeIn(250).removeClass('hidden');
        $('body').addClass('overflow-hidden');

        showToast('Inquiry sent to roderickorfella013@gmail.com! 🌸');
      })
      .catch(err => {
        console.warn('FormSubmit AJAX issue:', err);
        $btn.prop('disabled', false).removeClass('opacity-75 cursor-not-allowed');
        $btnIcon.removeClass('fa-spinner fa-spin').addClass('fa-paper-plane');
        $btnLabel.text('Send Inquiry to roderickorfella013@gmail.com');

        if (window.location.protocol === 'file:') {
          alert(
            "⚠️ FormSubmit requires a local web server!\n\n" +
            "Direct file browsing (file:///) prevents sending emails.\n\n" +
            "Please double-click 'start-preview.bat' in your BakeMeBebu folder to launch http://localhost:8000."
          );
        }

        $('#success-order-ref').text(refNum);
        $('#success-client-contact').text(phone);
        $('#send-ig-dm-btn').attr('href', 'https://ig.me/m/bakemebebuu');

        $('#inquiry-success-modal').fadeIn(250).removeClass('hidden');
        $('body').addClass('overflow-hidden');

        showToast('Inquiry recorded! You can also message us on Instagram.');
      });
  });

  $('#close-success-modal, #inquiry-success-modal .modal-overlay').on('click', function () {
    $('#inquiry-success-modal').fadeOut(200);
    $('body').removeClass('overflow-hidden');
  });

  /* ==========================================
     9. CHECKOUT PAGE LOGIC & ORDER PLACEMENT
     ========================================== */
  function renderCheckoutReview() {
    const items = getCartItems();
    const { count, subtotal, total } = calculateCartTotals();
    const $container = $('#checkout-items-list');

    if (!$container.length) return;

    if (items.length === 0) {
      $('#checkout-content-grid').hide();
      $('#checkout-empty-state').removeClass('hidden').show();
      return;
    }

    $('#checkout-empty-state').hide();
    $('#checkout-content-grid').show();

    let html = '';
    items.forEach((it, idx) => {
      html += `
        <div class="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
          <img src="${it.image}" alt="${it.name}" class="w-14 h-14 object-cover rounded-xl border border-stone-100 flex-shrink-0" />
          <div class="flex-grow min-w-0">
            <h4 class="font-bold text-stone-900 text-xs sm:text-sm truncate">${it.name}</h4>
            <p class="text-xs text-stone-500">Qty: ${it.quantity} × ₱${it.price.toFixed(2)}</p>
            ${it.notes ? `<p class="text-[11px] text-rose-600 truncate font-medium">Note: ${it.notes}</p>` : ''}
          </div>
          <div class="font-bold text-stone-900 text-xs sm:text-sm flex-shrink-0">
            ₱${(it.price * it.quantity).toFixed(2)}
          </div>
        </div>
      `;
    });
    $container.html(html);

    // Calculate delivery fee
    const fulfillment = $('input[name="fulfillment-mode"]:checked').val() || 'pickup';
    let deliveryFee = 0;
    if (fulfillment === 'delivery') {
      deliveryFee = 80; // Estimated delivery starting fee
      $('#checkout-delivery-fee-row').show();
      $('#checkout-delivery-fee').text('₱' + deliveryFee.toFixed(2));
      $('#delivery-address-section').slideDown(200);
    } else {
      $('#checkout-delivery-fee-row').hide();
      $('#delivery-address-section').slideUp(200);
    }

    const grandTotal = total + deliveryFee;

    $('#checkout-subtotal').text('₱' + subtotal.toFixed(2));
    $('#checkout-grand-total').text('₱' + grandTotal.toFixed(2));

    // Update payment method specific details
    updatePaymentMethodUI();
  }

  // Toggle delivery / pickup in checkout
  $(document).on('change', 'input[name="fulfillment-mode"]', function () {
    renderCheckoutReview();
  });

  // Toggle payment methods
  $(document).on('change', 'input[name="payment-mode"]', function () {
    updatePaymentMethodUI();
  });

  function updatePaymentMethodUI() {
    const method = $('input[name="payment-mode"]:checked').val() || 'gcash';
    $('.payment-details-box').hide();
    $(`#payment-details-${method}`).fadeIn(200);

    if (method === 'cod') {
      $('#payment-ref-label').html('Cash Change Note (Optional)');
      $('#payment-ref-number').attr('placeholder', 'e.g. Paying with exact cash, or need change for ₱1,000');
    } else {
      $('#payment-ref-label').html('GCash Reference Number <span class="text-rose-500">*</span>');
      $('#payment-ref-number').attr('placeholder', 'e.g. 902184029103 or "Sending receipt via Instagram DM"');
    }
  }

  // Handle Checkout Form Submission
  $('#bmb-checkout-form').on('submit', function (e) {
    e.preventDefault();

    const items = getCartItems();
    if (items.length === 0) {
      showToast('Your order bag is empty!');
      return;
    }

    const fullName = $('#order-customer-name').val().trim();
    const phone = $('#order-customer-phone').val().trim();
    const email = $('#order-customer-email').val().trim();
    const igHandle = $('#order-customer-ig').val().trim();
    const fulfillment = $('input[name="fulfillment-mode"]:checked').val();
    const targetDate = $('#order-target-date').val();
    const timeSlot = $('#order-time-slot').val();
    const paymentMethod = $('input[name="payment-mode"]:checked').val() || 'gcash';
    const paymentRef = $('#payment-ref-number').val().trim();
    const address = $('#order-delivery-address').val().trim();
    const specialInstructions = $('#order-special-notes').val().trim();

    let hasError = false;
    $('.form-error-msg').remove();
    $('.checkout-field').removeClass('border-red-500');

    function flagError($el, msg) {
      hasError = true;
      $el.addClass('border-red-500');
      $el.after(`<p class="form-error-msg text-xs text-red-500 mt-1 font-medium"><i class="fa-solid fa-circle-exclamation mr-1"></i>${msg}</p>`);
    }

    if (!fullName) flagError($('#order-customer-name'), 'Please provide your name.');
    if (!phone) flagError($('#order-customer-phone'), 'Please provide your mobile number for delivery/pickup coordination.');
    if (!targetDate) flagError($('#order-target-date'), 'Please pick your desired delivery or pickup date.');
    if (!timeSlot) flagError($('#order-time-slot'), 'Please select a preferred time window.');

    if (fulfillment === 'delivery' && !address) {
      flagError($('#order-delivery-address'), 'Please enter your complete delivery address & city.');
    }

    if (paymentMethod === 'gcash' && !paymentRef) {
      flagError($('#payment-ref-number'), 'Please enter your GCash reference number (or type "Sending via DM") to confirm payment.');
    }

    if (hasError) {
      $('html, body').animate({ scrollTop: $('.border-red-500').first().offset().top - 100 }, 350);
      return;
    }

    // Generate Order Record
    const orderNumber = 'BMB-' + Math.floor(100000 + Math.random() * 900000);
    const { subtotal, total } = calculateCartTotals();
    const deliveryFee = (fulfillment === 'delivery') ? 80 : 0;
    const finalAmount = total + deliveryFee;

    const paymentLabel = paymentMethod === 'cod'
      ? `CASH ON DELIVERY (COD)${paymentRef ? ' (' + paymentRef + ')' : ''}`
      : `GCASH (Ref: ${paymentRef || 'N/A'}) [Send to 0976 126 9382]`;

    const orderRecord = {
      orderNumber: orderNumber,
      datePlaced: new Date().toISOString(),
      customer: {
        name: fullName,
        phone: phone,
        email: email,
        igHandle: igHandle || 'None provided'
      },
      fulfillment: {
        type: fulfillment,
        address: address,
        targetDate: targetDate,
        timeSlot: timeSlot
      },
      payment: {
        method: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'GCash',
        refNumber: paymentMethod === 'cod' ? (paymentRef || 'Exact Cash / Pay on Delivery') : (paymentRef || 'Pending/Verification')
      },
      items: items,
      pricing: {
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        grandTotal: finalAmount
      },
      notes: specialInstructions
    };

    // Save order in history
    try {
      const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
      orders.unshift(orderRecord);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }

    const itemsText = items.map(it => `• ${it.quantity}x ${it.name} (₱${(it.price * it.quantity).toFixed(2)})`).join('\n');
    const rawOrderText =
      `Hello Bake Me, Bebu! 🌸\n` +
      `I placed an order on your website!\n\n` +
      `🧾 ORDER #: ${orderNumber}\n` +
      `👤 Name: ${fullName} (${phone})\n` +
      `📅 Target Date: ${targetDate} (${timeSlot})\n` +
      `🛵 Fulfillment: ${fulfillment.toUpperCase()}${address ? ' - ' + address : ''}\n` +
      `💳 Payment: ${paymentLabel}\n\n` +
      `📦 ORDER BREAKDOWN:\n${itemsText}\n` +
      `💰 Grand Total: ₱${finalAmount.toFixed(2)}\n\n` +
      (specialInstructions ? `💬 Notes: ${specialInstructions}\n\n` : '') +
      `Please confirm my slot. Thank you!`;

    window.lastOrderSummaryText = rawOrderText;
    const igMessage = encodeURIComponent(rawOrderText);

    // Populate Receipt UI
    $('#receipt-order-id').text(orderNumber);
    $('#receipt-name').text(fullName);
    $('#receipt-phone').text(phone);
    $('#receipt-date-time').text(`${targetDate} (${timeSlot})`);
    $('#receipt-fulfillment').text(fulfillment === 'delivery' ? `Delivery to: ${address}` : 'Self-Pickup at Biñan, Laguna Hub');
    $('#receipt-payment').text(
      paymentMethod === 'cod'
        ? `Cash on Delivery (COD)${paymentRef ? ' - ' + paymentRef : ''}`
        : `GCash (Ref: ${paymentRef || 'Pay on Pickup'}) • 0976 126 9382`
    );
    $('#receipt-grand-total').text('₱' + finalAmount.toFixed(2));
    
    let receiptItemsHtml = '';
    items.forEach(it => {
      receiptItemsHtml += `
        <div class="flex justify-between items-center text-xs py-1.5 border-b border-stone-100 last:border-0">
          <span class="text-stone-700 font-medium">${it.quantity}x ${it.name}</span>
          <span class="text-stone-900 font-bold">₱${(it.price * it.quantity).toFixed(2)}</span>
        </div>
      `;
    });
    $('#receipt-items-breakdown').html(receiptItemsHtml);

    $('#receipt-send-ig-btn').attr('href', `https://ig.me/m/bakemebebuu`);
    $('#receipt-whatsapp-btn').attr('href', `https://wa.me/?text=${igMessage}`);

    // Clear cart
    saveCartItems([]);

    // Show Receipt Modal / Page View
    $('#order-success-modal').fadeIn(300).removeClass('hidden');
    $('body').addClass('overflow-hidden');
  });

  // Copy Order Message to Clipboard
  $(document).on('click', '#btn-copy-receipt-msg', function () {
    if (window.lastOrderSummaryText) {
      navigator.clipboard.writeText(window.lastOrderSummaryText).then(() => {
        $('#copy-btn-label').text('✓ Copied to Clipboard!');
        showToast('Order details copied! Paste them into your Instagram DM.');
        setTimeout(() => {
          $('#copy-btn-label').text('Copy Order Details to Clipboard');
        }, 3000);
      }).catch(() => {
        showToast('Please print receipt or take a screenshot!');
      });
    }
  });

  // Print Receipt Button
  $(document).on('click', '#btn-print-receipt', function () {
    window.print();
  });

  /* ==========================================
     10. INITIALIZE ON LOAD
     ========================================== */
  updateCartUI();
  updatePaymentMethodUI();
});
