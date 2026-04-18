# Pre-Integration Tests

Folder ini khusus untuk test backend sebelum integrasi ke frontend.

Tujuannya:

- memastikan auth helper aman dipakai
- memastikan kontrak dasar token/password valid
- mencegah regresi sebelum FE mulai consume endpoint
- memastikan flow auth API (register/login/logout/forgot/reset) tetap stabil

Jalankan semua pre-integration test:

```bash
bun run test:preintegration
```

Jalankan auth pre-integration test saja:

```bash
bun run test:preintegration:auth
```

Catatan:

- Script pre-integration sekarang otomatis:
	- membaca `DATABASE_URL` dari `.env` (atau fallback local)
	- menjalankan `db:push`
	- menjalankan `db:seed`
	- baru menjalankan test