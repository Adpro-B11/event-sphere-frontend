# Adpro-B11 

# Architecture

## Context Diagram
![Image](https://github.com/user-attachments/assets/2c7e668d-b8cb-417f-98da-98228d0a6a44)

## Container
![Image](https://github.com/user-attachments/assets/202bd7ff-1b46-4601-a91b-ec50124f43fb)

## Deployment Diagram
![Image](https://github.com/user-attachments/assets/0daa3023-3ca9-4bd5-a212-792158fda3f7)

## Future Architecture

### Context Diagram
![Image](https://github.com/user-attachments/assets/2226a0d3-10b1-433e-9485-8ec97f39bb17)

### Container Diagram
![Image](https://github.com/user-attachments/assets/4a0ecde6-4d97-4788-a205-be7628067fa2)


# Explanation of risk storming 
Pemisahan Ticket System dari Event Sphere System memberikan beberapa keuntungan strategis untuk aplikasi manajemen acara yang berkembang pesat. Sistem tiket yang berdiri sendiri memungkinkan penskalaan independen saat terjadi lonjakan permintaan, terutama selama peluncuran tiket acara populer. Pendekatan ini juga mendukung separation of concerns, dimana tim pengembang tiket dapat bekerja secara otonom tanpa memengaruhi komponen sistem lainnya. Namun, perlu disadari bahwa pemisahan ini menciptakan tantangan tersendiri, seperti kebutuhan untuk menjaga konsistensi data antara sistem tiket dan event sphere, serta perlunya implementasi mekanisme failover khusus karena sistem tiket menjadi komponen kritis pendapatan.

Penambahan API Gateway dalam arsitektur yang dimodifikasi juga membawa nilai signifikan. Gateway ini berfungsi sebagai titik masuk tunggal yang menyederhanakan akses klien ke berbagai layanan mikro. Keberadaannya memungkinkan penerapan kebijakan keamanan terpusat seperti autentikasi dan otorisasi, sekaligus memfasilitasi monitoring, rate limiting, dan load balancing. Meski demikian, API Gateway dapat menjadi single point of failure jika tidak dirancang dengan redundansi yang memadai. Seiring meningkatnya popularitas aplikasi, gateway harus mampu diskalakan untuk menangani volume permintaan yang tinggi, sementara kompleksitas rute API akan bertambah seiring bertambahnya layanan.

Implementasi arsitektur microservices dengan Spring Boot dan PostgreSQL memberikan fleksibilitas yang dibutuhkan untuk pertumbuhan jangka panjang. Pendekatan ini memungkinkan setiap komponen—seperti layanan tiket, pembayaran, dan autentikasi—diskalakan secara independen sesuai kebutuhan. Penggunaan Spring Boot menawarkan kerangka kerja yang matang dengan kemampuan cloud-native, sementara database PostgreSQL terpisah untuk setiap layanan memastikan isolasi data dan performa yang optimal. Untuk aplikasi yang sukses di masa depan, arsitektur ini perlu dilengkapi dengan strategi sharding dan replikasi database untuk menangani pertumbuhan volume data. Kompleksitas transaksi terdistribusi antar layanan juga memerlukan implementasi pola saga atau eventual consistency yang tepat, sementara potensi ekspansi global mungkin mengharuskan deployment multi-region dengan strategi replikasi lintas region. Integrasi sistem antrian seperti Kafka atau RabbitMQ juga perlu dipertimbangkan untuk memfasilitasi komunikasi asinkron yang efisien antar layanan saat beban mencapai puncak.

# Component Diagram and Code Diagram 

* Event Management 

![Event Management - Component Diagram](https://github.com/user-attachments/assets/ede38158-74b5-4a1c-adfa-71bb18232d89)
![Event Management - Code Diagram](https://github.com/user-attachments/assets/d223b003-f73e-41a7-8ced-f915f88abcf9)

* Ticketing Management 
* Review and Rating 
* Payment, Balance Management
* Report System