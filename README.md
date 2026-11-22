# Backend Inventory Management

## Menjalankan aplikasi

npm install
npm run dev

## Environments

DATABASE_URL=<connection-string-mongodb>
SECRET_KEY_TOKEN=<secret-acak-yang-panjang>

## Note

Saya membuat create, update dan delete hanya bisa dilakukan oleh user yang memiliki role admin. saya sudah mengekspor collection user dan item di dalam folder data pada project ini. jika sudah di impor anda bisa login sebagai admin dengan memasukkan request body sebagai berikut:
    "identifier": "Super Admin",
    "password": "admin001"
untuk identifier bisa menggunakan email atau full_name dari user yang ingin login, berikut email dari admin: admin001@mail.com

saya juga sudah mengeksport collection postman pada direktory data/INVENTORY MANAGEMENT

## Alur request

Untuk endpoint item, request berjalan melalui alur berikut:

```text
Client -> Express Router -> Middleware autentikasi/otorisasi -> Controller -> Mongoose Model -> MongoDB
```

Router memilih handler berdasarkan method dan URL. Untuk endpoint yang memerlukan login, middleware memverifikasi JWT; middleware admin juga memeriksa role sebelum request diteruskan. Controller memvalidasi input dan menjalankan aturan endpoint, lalu memakai model Mongoose untuk membaca atau mengubah data di MongoDB. Hasilnya dikirim kembali sebagai respons HTTP.

Saat ini proyek belum memiliki lapisan service atau repository terpisah. Untuk ukuran proyek sekarang, controller berinteraksi langsung dengan model. Pemisahan router, middleware, controller, dan model tetap membantu menjaga tanggung jawab tiap bagian tetap jelas: routing mengatur URL, middleware menangani akses, controller mengatur alur request dan respons, sedangkan model mendefinisikan bentuk serta validasi data. Jika aturan bisnis bertambah, service dapat menampung aturan tersebut dan repository dapat mengisolasi akses database. Pemisahan ini memudahkan perubahan dan pengujian tanpa membuat satu file menangani semua hal.

## Keamanan dan penyimpanan JWT

Untuk aplikasi browser, pilihan yang disarankan adalah cookie `HttpOnly`, `Secure`, dan `SameSite` yang dikirim melalui HTTPS. `HttpOnly` mencegah JavaScript membaca token sehingga mengurangi risiko pencurian token melalui XSS. `Secure` membatasi pengiriman cookie ke koneksi HTTPS, sedangkan `SameSite` membantu mengurangi pengiriman cookie lintas situs.

Cookie otomatis dikirim browser, sehingga ada risiko CSRF. Gunakan kebijakan `SameSite` yang sesuai dan perlindungan CSRF tambahan bila kebutuhan lintas situs mengharuskan cookie dikirim pada request lintas situs. Cookie juga tidak menghilangkan risiko XSS: skrip berbahaya tetap dapat melakukan request dari halaman yang disusupi walaupun tidak dapat membaca nilai cookie.

`localStorage` lebih mudah digunakan dengan pola API saat ini, yang mengembalikan JWT di body respons untuk dikirim ulang sebagai `Authorization: Bearer <token>`. Namun, JavaScript dapat membaca `localStorage`; XSS yang berhasil dapat mencuri token dan menggunakannya sampai token kedaluwarsa atau dicabut. Jangan menyimpan token sensitif jangka panjang di sana. Jika memilih cookie HttpOnly, backend perlu mengubah login agar memasang cookie dan middleware autentikasi membaca token dari cookie (serta menerapkan perlindungan CSRF yang diperlukan).

## Mencegah stok negatif saat request bersamaan

Pengecekan stok lalu pengurangan dalam dua operasi terpisah tidak aman. Dua request dapat sama-sama membaca stok `1`, lalu keduanya menguranginya. Gunakan satu operasi atomik MongoDB yang menggabungkan syarat stok cukup dan pengurangan stok. Contohnya, jika `quantity` adalah jumlah yang diminta:

```js
const item = await ItemModel.findOneAndUpdate(
  { _id: itemId, stock: { $gte: quantity } },
  { $inc: { stock: -quantity } },
  { new: true, runValidators: true }
);

if (!item) {
  // Item tidak ditemukan atau stok tidak mencukupi.
  return res.status(409).json({ message: "Stok tidak mencukupi" });
}
```

MongoDB menjalankan update dokumen tersebut secara atomik. Jika stok awal `1` dan dua request bersamaan masing-masing meminta `1`, hanya satu yang akan memenuhi filter `stock: { $gte: 1 }`; request lainnya tidak mengubah dokumen dan menerima respons konflik. Aturan minimum stok `0` pada schema tetap menjadi validasi tambahan, tetapi tidak menggantikan update atomik. Endpoint pengurangan stok/checkout belum tersedia di API saat ini; pola ini perlu dipakai saat endpoint tersebut ditambahkan.
