
// Ambil elemen DOM
const menuToggle = document.getElementById('mobile-menu');
const navList = document.getElementById('nav-list');

// Fungsi untuk buka/tutup menu mobile
menuToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
    
    // Opsional: Animasi icon hamburger menjadi silang (X)
    menuToggle.classList.toggle('is-active');
});

// Menutup menu otomatis saat salah satu link navigasi diklik
const navLinks = document.querySelectorAll('#nav-list li a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
    });
});

// Efek scroll navbar (opsional: navbar berubah warna saat di-scroll)
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(0, 0, 0, 0.95)';
        nav.style.padding = '15px 8%';
    } else {
        nav.style.background = 'rgba(0, 0, 0, 0.9)';
        nav.style.padding = '20px 8%';
    }
});

