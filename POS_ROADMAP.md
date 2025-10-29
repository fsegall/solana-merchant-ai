# 🧭 POS Integration Roadmap – Merchant AI Checkout

> **Goal:** Map the evolution of Merchant AI Checkout from mobile app to native integration in Android POS terminals, positioning the product as the **crypto-friendly POS terminal** for commerce.

---

## 🎯 Phase 1 – Mobile Web App (current)

**Status:** ✅ Functional MVP

### 🧩 Description

* Merchants use their **smartphone as a payment terminal**
* Customer scans a **Solana Pay QR code** (standard URI `solana:pay?...`)
* Transaction happens **directly on-chain**, no intermediaries

### ⚙️ Technologies

* **Frontend:** React + Tailwind (PWA mode)
* **Wallet:** Solana Wallet Adapter / Phantom / Solflare
* **Payments:** Solana Pay SDK
* **Optional conversion:** Jupiter Aggregator (auto-swap)

### 🧠 Expected Results

* Complete functional demo (simulated sales)
* Simple on-chain transaction dashboard
* Foundation for external hardware integration (Bluetooth QR printers, etc.)

---

## 📱 Phase 2 – Merchant App (Native Android)

**Status:** 🔄 Planned

### 🧩 Description

* Convert PWA into **native Android app** via **React Native** or **Capacitor**
* Direct integration with **camera**, **Bluetooth thermal printer**, and **push notifications**
* Partial offline support (store & forward mode) for areas without connection

### ⚙️ Key Technologies

* Capacitor.js or React Native CLI
* Expo SDK (optional)
* Solana Mobile Wallet Adapter (React Native bridge)
* Secure WebView for hybrid UI
* SQLite / IndexedDB local storage

### 📦 Main Deliverables

* Android app with Supabase login and embedded Solana wallet
* QR scanner and Solana Pay QR generation
* Integration with **portable thermal printers** (Sunmi, Elgin, MPT-III)

---

## 💳 Phase 3 – POS Android Integration (Terminal)

**Status:** 🧭 Roadmap 2026

### 🧩 Description

* Direct installation on **Android POS terminals** (PAX, Ingenico, Sunmi, Verifone)
* Hardware acts as single terminal: NFC reader, printer, camera, screen
* Crypto checkout initiated via **tap (NFC)** or **Solana Pay QR**

### ⚙️ Compatible Environments

| Manufacturer | SDK / System                     | Support    | Notes                                  |
| ------------ | -------------------------------- | ---------- | -------------------------------------- |
| **Sunmi**    | Android SDK + Printer Service    | ✅ Yes      | Standard Android, easy integration     |
| **PAX**      | PAXSTORE SDK (A920, D210)        | ✅ Yes      | Requires developer account             |
| **Ingenico** | Telium Tetra / Android           | ⚠️ Partial | Requires PCI certification             |
| **Verifone** | Android Secure Environment       | ⚠️ Limited | Closed control, partnerships required  |

### 🔐 Technical Considerations

* App distributed via APK or PAXSTORE Marketplace
* Secure communication with backend (Supabase + Edge Functions)
* Digital transaction signing via local wallet (on POS)
* Support for **WebUSB / WebSerial** for future peripherals

### 🧠 Benefits

* Eliminates smartphone intermediary
* Expands usage to **real physical retail**
* Facilitates integration with **fiscal counters / ERP / NFC-e**

---

## 🪙 Phase 4 – POS Crypto Gateway (OEM SDK)

**Status:** 🚀 Strategic Vision

### 🧩 Description

Create a **crypto-native payment SDK for terminal manufacturers**, allowing any POS in the market to natively accept Solana tokens (or multi-chain).

### ⚙️ Structure

* SDK in TypeScript / Kotlin / Rust (depending on hardware)
* Support for **Solana Pay**, **WalletConnect**, and **Jupiter auto-swap**
* APIs for **legacy system integration (PSPs)**
* Optional support for **off-ramp providers (Wise / Circle / Transfero)**

### 🌍 Potential Partnerships

* Manufacturers: **Sunmi**, **PAX**, **Elgin**
* Crypto-friendly PSPs: **OpenPix**, **Helio**, **Circle**, **Wise**
* Blockchains: **Solana**, **Stellar**, **Polygon**, **Celo**

### 🧱 Modular Structure

```
MerchantPOS SDK
├── payments/solana-pay.ts
├── swap/jupiter.ts
├── off-ramp/circle.ts
├── off-ramp/wise.ts
├── ui/terminal.tsx
└── printer/thermal.ts
```

### 💡 Future Use Case

> "A merchant buys a Sunmi terminal with Livre Soltech SDK pre-installed.
> They log in, connect their Solana wallet, and start accepting payments in BRZ, USDC, or JupUSD,
> printing receipts directly at the counter, all in seconds."

---

## 📊 Roadmap Summary

| Phase | Name         | Platform                  | Goal                      | Status         |
| ---- | ------------ | ------------------------- | ------------------------- | -------------- |
| 1    | Web App      | PWA (React + Solana Pay)  | Functional MVP            | ✅ Completed   |
| 2    | Mobile App   | Android (Capacitor / RN)   | Native app with peripherals| 🔄 Planned    |
| 3    | POS Android  | Sunmi / PAX / Ingenico    | Direct installation on terminal | 🧭 2026     |
| 4    | POS SDK      | OEM / Manufacturers       | Embedded crypto gateway   | 🚀 Vision      |

---

## 🏁 Conclusion

**Merchant AI Checkout** is on the path to become Brazil's first truly interoperable **crypto-native POS system**.

The journey starts on the merchant's phone and evolves to dedicated hardware, maintaining the same principle:
**direct payment, no intermediaries, with optional fiat.**

> "From a QR on the phone to a crypto-friendly terminal — a cypherpunk checkout with market UX."

