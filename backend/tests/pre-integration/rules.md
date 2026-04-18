# Pre-Integration Testing Rules

- Fokus ke behavior inti backend sebelum FE terhubung.
- Jangan menguji tampilan atau concern frontend di folder ini.
- Test harus deterministic dan cepat.
- Untuk test auth basic, utamakan helper token/password, schema validation, dan flow endpoint auth utama.
- Test yang butuh database boleh ditaruh di folder ini jika diberi setup/teardown yang jelas.
- Jalankan `bun run check:preintegration` sebelum mulai integration ke FE.