let cart = JSON.parse(localStorage.getItem('FaLys_cart')) || [];
let currentImgIdx = 0;
let totalModalImgs = 0;

function renderProduk() {
    const container = document.getElementById('product-container');
    if(!container) return;
    container.innerHTML = db_produk.map(p => `
        <div class="card">
            <img src="${p.images[0]}" onclick="openDetail('${p.id}')">
            <div class="card-info">
                <h3 onclick="openDetail('${p.id}')">${p.nama}</h3>
                <p class="price">Rp ${p.harga.toLocaleString('id-ID')}</p>
                <button class="add-btn" onclick="addToCart('${p.id}')">Beli Sekarang</button>
            </div>
        </div>
    `).join('');
}

function openDetail(id) {
    // Pastikan ID dibandingkan sebagai string
    const p = db_produk.find(x => x.id.toString() === id.toString());
    if(!p) return;

    const gallery = document.getElementById('modal-gallery-container');
    currentImgIdx = 0;
    totalModalImgs = p.images.length;
    gallery.innerHTML = p.images.map(img => `<img src="${img}">`).join('');
    gallery.style.transform = `translateX(0)`;
    
    document.getElementById('modal-nama').innerText = p.nama;
    document.getElementById('modal-harga').innerText = `Rp ${p.harga.toLocaleString()}`;
    document.getElementById('modal-deskripsi').innerText = p.desc;
    
    // Perbaikan tanda kutip pada tombol di dalam modal
    document.getElementById('modal-btn-container').innerHTML = `
        <button class="add-btn" onclick="addToCart('${p.id}'); closeDetail();">Tambah Ke Keranjang</button>
    `;
    document.getElementById('detail-modal').style.display = 'block';
}

function addToCart(id) {
    // Mencari dengan konversi toString() agar lebih aman
    const item = db_produk.find(p => p.id.toString() === id.toString());
    if (item) {
        cart.push({...item});
        updateUI();
    }
}

function removeFromCart(id) {
    const index = cart.findIndex(item => item.id.toString() === id.toString());
    if (index > -1) {
        cart.splice(index, 1);
    }
    updateUI();
}

function updateUI() {
    localStorage.setItem('FaLys_cart', JSON.stringify(cart));
    const countEl = document.getElementById('cart-count');
    if(countEl) countEl.innerText = cart.length;
    const listContainer = document.getElementById('cart-items-list');
    const totalPriceEl = document.getElementById('total-price');
    if (!listContainer) return;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Keranjang kosong</p>';
        if(totalPriceEl) totalPriceEl.innerText = 'Rp 0';
        return;
    }

    const groupedCart = cart.reduce((acc, item) => {
        const found = acc.find(x => x.id.toString() === item.id.toString());
        if (found) found.qty++; else acc.push({...item, qty: 1});
        return acc;
    }, []);

    listContainer.innerHTML = groupedCart.map(item => `
        <div class="cart-item" style="display:flex; gap:15px; margin-bottom:15px; background:#f9f9f9; padding:10px; border-radius:10px; align-items:center;">
            <img src="${item.images[0]}" style="width:60px; height:60px; object-fit:cover; border-radius:5px;">
            <div style="flex:1;">
                <h5 style="font-size:0.9rem; margin-bottom:3px;">${item.nama}</h5>
                <p style="font-size:0.8rem; color:var(--accent); font-weight:bold;">Rp ${item.harga.toLocaleString()} x ${item.qty}</p>
            </div>
            <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:red; cursor:pointer; font-size:1.2rem;">&times;</button>
        </div>
    `).join('') + `
        <div style="margin-top:20px; padding:15px; border-top:2px solid #eee; background:#fff; border-radius: 10px; font-size: 0.85rem;">
            <p style="font-weight:bold; margin-bottom:10px;">Data Pengiriman:</p>
            <input type="text" id="input-nama" placeholder="Nama Lengkap" style="width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #ddd; box-sizing:border-box;">
            <textarea id="input-alamat" placeholder="Alamat Lengkap" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd; height:60px; box-sizing:border-box; margin-bottom:15px;"></textarea>
            
            <p style="font-weight:bold; margin-bottom:8px;">Pilih Ukuran Baju:</p>
            <select id="input-ukuran" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #ddd; background: white;">
                <option value="M">Ukuran M</option>
                <option value="L">Ukuran L</option>
                <option value="XL">Ukuran XL</option>
                <option value="Custom">Custom (Tulis di Catatan)</option>
            </select>

            <p style="font-weight:bold; margin-bottom:8px;">Opsi Bahan Kain:</p>
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px;"><input type="radio" name="opsi-kain" value="Kain Sendiri" checked> Pakai Kain Sendiri (Jasa Jahit)</label>
                <label style="display:block;"><input type="radio" name="opsi-kain" value="Kain dari Toko"> Kain dari FaLys Collection</label>
            </div>

            <p style="font-weight:bold; margin-bottom:5px;">Catatan Tambahan:</p>
            <textarea id="input-catatan" placeholder="Contoh: Request kerah tegak, panjang baju ditambah 2cm, dll..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd; height:60px; box-sizing:border-box;"></textarea>
            
            <div style="margin-top:15px; padding:10px; background:#fff9e6; border-left:4px solid #ffcc00; font-size:0.75rem; color:#666; line-height:1.4;">
                <strong>Info Penting:</strong> Kakak juga bisa mengirimkan kain batik pilihan sendiri kepada kami. Biaya akan lebih murah (hanya jasa jahit). Jika kain dari kami, harga akan menyesuaikan. Kami mengutamakan kualitas jahitan!
            </div>
        </div>
    `;

    const total = cart.reduce((sum, item) => sum + item.harga, 0);
    if(totalPriceEl) totalPriceEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}




// ... Sisa fungsi lainnya (sendToWA, autoSlide, dll) tetap sama ...

function sendToWA() {
    if(cart.length === 0) return alert("Keranjang Anda masih kosong!");
    
    const nama = document.getElementById('input-nama')?.value.trim();
    const alamat = document.getElementById('input-alamat')?.value.trim();
    const ukuran = document.getElementById('input-ukuran')?.value;
    const catatan = document.getElementById('input-catatan')?.value.trim() || "-";
    const opsiKain = document.querySelector('input[name="opsi-kain"]:checked')?.value;

    if(!nama || !alamat) {
        return alert("Mohon lengkapi Nama dan Alamat!");
    }
    
    const nomorWA = "6288902899156";
    let pesan = `*ORDER BARU - FaLys COLLECTION*\n`;
    pesan += `----------------------------------\n`;
    pesan += `*Nama:* ${nama}\n`;
    pesan += `*Alamat:* ${alamat}\n`;
    pesan += `*Ukuran:* ${ukuran}\n`;
    pesan += `*Opsi Kain:* ${opsiKain}\n`;
    pesan += `*Catatan:* ${catatan}\n`;
    pesan += `----------------------------------\n\n`;
    pesan += `*Daftar Pesanan:*\n`;
    
    const groupedCart = cart.reduce((acc, item) => {
        const found = acc.find(x => x.id.toString() === item.id.toString());
        if (found) found.qty++; else acc.push({...item, qty: 1});
        return acc;
    }, []);

    groupedCart.forEach(item => {
        pesan += `- ${item.nama} (x${item.qty})\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.harga, 0);
    pesan += `\n*Total Estimasi: Rp ${total.toLocaleString('id-ID')}*`;
    pesan += `\n\n_*) Harga dapat berubah tergantung pilihan kain dan detail jahitan._`;
    
    window.open(`https://api.whatsapp.com/send?phone=${nomorWA}&text=${encodeURIComponent(pesan)}`, '_blank');
}


function openCart() { document.getElementById('cart-sidebar').classList.add('active'); }
function closeCart() { document.getElementById('cart-sidebar').classList.remove('active'); }
function closeDetail() { document.getElementById('detail-modal').style.display = 'none'; }

// Auto Banner
let slideIdx = 0;
function autoSlide() {
    let slides = document.getElementsByClassName("mySlides");
    if(slides.length === 0) return;
    for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";
    slideIdx++; if (slideIdx > slides.length) slideIdx = 1;
    slides[slideIdx-1].style.display = "block";
    setTimeout(autoSlide, 5000);
}

window.onload = () => {
    renderProduk();
    updateUI();
    autoSlide();
};

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');
    const menuIcon = document.getElementById('mobile-menu');

    // Tambah/Hapus class 'active'
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
    
    // Animasi tombol hamburger (Opsional)
    if(navLinks.classList.contains('active')) {
        menuIcon.children[0].style.transform = "rotate(45deg) translate(5px, 6px)";
        menuIcon.children[1].style.opacity = "0";
        menuIcon.children[2].style.transform = "rotate(-45deg) translate(5px, -6px)";
    } else {
        menuIcon.children[0].style.transform = "none";
        menuIcon.children[1].style.opacity = "1";
        menuIcon.children[2].style.transform = "none";
    }
}

let slideIndex = 1;
showSlides(slideIndex);

// Kontrol Next/Prev
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Kontrol Thumbnail
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}

// Opsional: Otomatis Pindah Slide
setInterval(() => {
  plusSlides(1);
}, 5000); 
