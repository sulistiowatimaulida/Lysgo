const daftarProduk = [
    {
        id: "Kemeja",
        nama: "Kemeja Batik pria",
        harga: "Rp 150.000",
        // Daftar gambar untuk slide detail
        gambarList: [
            "img/batik-bergundy.png",
            "img/batik-bergundy2.jpg",
            "img/fotbar-bergundy.jpg"
        ],
        deskripsi: "Batik ini menggunakan kombinasi motif Kontemporer dengan sentuhan Pesisiran. Terdapat ornamen bunga (flora) yang luwes dipadukan dengan pola awan atau batuan (semacam Mega Mendung atau Wadasan) yang diabstraksikan.",
        spesifikasi: [
            "Katun Primisima",
            "Model Kerah: Standar / Sanghai (Custom)",
            "Pilihan Lengan: Pendek / Panjang",
            "Estimasi Pengerjaan: Seminggu Pengerjaan"
        ]
    },
    {
        id: "Batik",
        nama: "Kemeja pria batik navy",
        harga: "Rp 150.000",
        gambarList: [
            "img/batik-navy.jpg",
            "img/dpn-navy.jpg",
            "img/detail-navy.jpg"
        ],
        deskripsi: "Dominasi warna Indigo Blue (Biru Tua) dan Steel Blue (Biru Abu-abu) dengan aksen putih tulang. Warna dingin seperti ini sangat populer karena memberikan kesan profesional, tenang, dan mudah dipadukan dengan celana jeans gelap (seperti pada gambar) maupun celana bahan hitam.",
        spesifikasi: [
            "Bahan: Katun Sanforized",
            "Model Kerah: Standar / Sanghai (Custom)",
            "Estimasi Pengerjaan: 7-14 Hari Kerja"
        ]
    }
];

function renderKatalog() {
    const container = document.getElementById('produkContainer');
    const modalContainer = document.getElementById('modalContainer');
    
    let htmlKatalog = '';
    let htmlModal = '';

    daftarProduk.forEach(produk => {
        // Tampilan Utama (Cover menggunakan gambar pertama)
        htmlKatalog += `
            <div class="col-md-4">
                <div class="card card-product h-100" data-bs-toggle="modal" data-bs-target="#modal${produk.id}">
                    <div class="img-placeholder">
                        <img src="${produk.gambarList[0]}" alt="${produk.nama}">
                    </div>
                    <div class="card-body p-4 text-center">
                        <h5 class="fw-bold">${produk.nama}</h5>
                        <p class="text-muted small mb-3">Mulai dari ${produk.harga}</p>
                        <button class="btn btn-outline-dark btn-sm rounded-pill px-3">Lihat Detail</button>
                    </div>
                </div>
            </div>
        `;

        // Logika Carousel untuk Gambar di dalam Modal
        let slides = '';
        let indicators = '';
        produk.gambarList.forEach((img, index) => {
            indicators += `<button type="button" data-bs-target="#carousel${produk.id}" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}"></button>`;
            slides += `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${img}" class="d-block w-100 rounded-4 shadow-sm" style="height: 350px; object-fit: cover;" alt="${produk.nama}">
                </div>
            `;
        });

        const listSpek = produk.spesifikasi.map(s => `<li>${s}</li>`).join('');
        
        htmlModal += `
            <div class="modal fade" id="modal${produk.id}" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content p-2" style="background-color: #FDFBF0; border-radius: 20px;">
                        <div class="modal-header border-0">
                            <h3 class="modal-title fw-bold">${produk.nama}</h3>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body row">
                            <div class="col-md-6 mb-3">
                                <div id="carousel${produk.id}" class="carousel slide" data-bs-ride="carousel">
                                    <div class="carousel-indicators">
                                        ${indicators}
                                    </div>
                                    <div class="carousel-inner">
                                        ${slides}
                                    </div>
                                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel${produk.id}" data-bs-slide="prev">
                                        <span class="carousel-control-prev-icon"></span>
                                    </button>
                                    <button class="carousel-control-next" type="button" data-bs-target="#carousel${produk.id}" data-bs-slide="next">
                                        <span class="carousel-control-next-icon"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <p class="text-muted">${produk.deskripsi}</p>
                                <h6 class="fw-bold mt-4">Spesifikasi:</h6>
                                <ul class="small">${listSpek}</ul>
                                <div class="mt-4 p-3 bg-white rounded-3 border">
                                    <p class="mb-1 small text-muted">Estimasi Biaya Jasa:</p>
                                    <h4 class="fw-bold text-dark mb-0">${produk.harga}</h4>
                                </div>
                                <div class="mt-4 text-center">
                                    <a href="#pesan" class="btn btn-dark w-100 rounded-pill py-2" data-bs-dismiss="modal">Pesan Model Ini</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlKatalog;
    modalContainer.innerHTML = htmlModal;
}

document.addEventListener('DOMContentLoaded', renderKatalog);
