
<div align="center">
  <img src="https://raw.githubusercontent.com/parevo/mergen/refs/heads/main/assets/mergen.png" alt="Mergen Logo" width="120" height="120" />
  <h1>Mergen</h1>
  <p>
    <b>The Aesthetic & High-Performance Database Client</b>
  </p>
  <p>
    Built for the modern developer. Native speed, web flexibility.
  </p>

  [![Go Report Card](https://goreportcard.com/badge/github.com/ahmetbilgay/rune)](https://goreportcard.com/report/github.com/ahmetbilgay/rune)
  [![License](https://img.shields.io/github/license/ahmetbilgay/rune?style=flat-square)](LICENSE)
  [![Wails](https://img.shields.io/badge/Powered_by-Wails_v2-red?style=flat-square&logo=wails)](https://wails.io)
  [![React](https://img.shields.io/badge/Frontend-React-blue?style=flat-square&logo=react)](https://reactjs.org)

  <br />

  <img src="./assets/preview.png" alt="RuneDB Application Preview" width="100%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

<br />

## ⚡ What is Mergen?

**Mergen** is a next-generation database management tool designed to bridge the gap between **native performance** and **modern web aesthetics**. 

Unlike clunky, legacy SQL clients, Mergen offers a buttery-smooth experience with a focus on visual clarity. Written in **Go** and **React**, it starts instantly, runs everywhere, and looks beautiful doing it.

---

## ✨ Key Features

### 🚀 **Native Performance**
Powered by a **Go** backend and the **Wails** framework, Mergen consumes a fraction of the memory of Electron-based apps while delivering native-speed query execution.

### 🎨 **Stunning Visuals & Theming**
- **Adaptive UI**: Seamlessly switches between Dark and Light modes.
- **Modern Design**: Clean typography, glassmorphism accents, and a clutter-free workspace.

### 🛡️ **Secure Access**
- **SSH Tunneling**: Connect to your production databases securely through SSH tunnels. Native support built right in.
- **Connection Manager**: Organize your connections (MySQL, PostgreSQL) with ease.

### ⌨️ **Developer-First Workflow**
- **Command Palette (`Cmd+K`)**: Navigate anywhere, execute commands, and switch contexts without lifting your hands from the keyboard.
- **Multi-Tab Interface**: juggle multiple queries and table views simultaneously without losing context.

### 📊 **Visual Data Editor**
- **Spreadsheet-like Editing**: Double-click to edit cells, add rows, or delete data.
- **Safe Mode**: Changes are staged before committing, preventing accidental data loss.

### 📥 **Universal Data Export**
- **Flexibility**: Export entire datasets to Excel (`.xlsx`), CSV, or JSON formats in one click.
- **Native Experience**: Uses native system dialogs for saving files, integrating seamlessly with your OS.

### 🔄 **Stay Updated**
- **Auto-Update**: Mergen automatically checks for updates, ensuring you always have the latest features and security patches.

---

## 🛠️ Tech Stack

Mergen is built on the shoulders of giants:

| Component | Technology | Description |
|-----------|------------|-------------|
| **Core** | [Wails v2](https://wails.io) | The bridge between Go and the web frontend. |
| **Backend** | [Go (Golang)](https://go.dev) | Handles DB connections, SSH tunneling, and file I/O. |
| **Frontend** | [React](https://reactjs.org) | Component-based UI architecure. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | Utility-first styling for rapid UI development. |
| **State** | TypeScript | Type-safe interactions across the entire stack. |

---

## 🚀 Getting Started

### Prerequisites

- **Go**: v1.23 or higher
- **Node.js**: v20 or higher
- **NPM**: Latest version

### Installation (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmetbilgay/rune.git
   cd rune
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   cd frontend && npm install && cd ..
   ```

3. **Run in Dev Mode**
   ```bash
   wails dev
   # This will launch the app and hot-reload on changes
   ```

### Building for Production

To create a standalone binary for your OS:

```bash
wails build
```

The output binary will be located in the `build/bin/` directory.

---

## 🤝 Contributing

We love contributions! Whether it's a bug fix, a new feature, or just a typo fix:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ahmetbilgay">Ahmet Can Bilgay</a></p>
</div>
