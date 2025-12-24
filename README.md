
<div align="center">
  <img src="https://raw.githubusercontent.com/parevo/mergen/refs/heads/main/assets/mergen.png" alt="Mergen Logo" width="150" height="150" />
  <h1>Mergen</h1>
  <h3>The Art of Database Management</h3>
  <p>
    <b>Beautiful. Powerful. Native.</b>
  </p>
  <p>
    Redefining the standard for modern database clients.
  </p>

  [![Go Report Card](https://goreportcard.com/badge/github.com/parevo/mergen)](https://goreportcard.com/report/github.com/parevo/mergen)
  [![License](https://img.shields.io/github/license/parevo/mergen?style=flat-square)](LICENSE)
  [![Wails](https://img.shields.io/badge/Powered_by-Wails_v2-red?style=flat-square&logo=wails)](https://wails.io)
  [![React](https://img.shields.io/badge/Frontend-React-blue?style=flat-square&logo=react)](https://reactjs.org)

  <br />

  <video src="https://github.com/parevo/mergen/raw/main/assets/mergen_tutorial.mp4" width="100%" controls autoplay loop muted style="border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);"></video>
</div>

<br />

## 🌟 Why Mergen?

In a world of clunky, Electron-heavy database tools, **Mergen** stands apart. We built Mergen with a single philosophy: **Developer tools should be as beautiful as they are powerful.**

Mergen combines the raw performance of **Go** with the fluid interactivity of **React**, delivering an experience that feels native, instant, and incredibly responsive. It's not just a tool; it's a workspace you'll love to inhabit.

---

## 🚀 Key Features

### ✨ **Unmatched Aesthetics**
Experience a UI designed for focus and clarity.
- **Glassmorphism Design**: Modern, translucent interfaces that blend perfectly with your OS.
- **Adaptive Themes**: Seamlessly switches between Dark and Light modes. Choose from curated palettes like *Ocean Blue*, *Royal Purple*, and *Forest Green*.
- **Distraction-Free**: A clean workspace that puts your data front and center.

### 🛡️ **Fortress-Level Reliability & Security**
Your data is your most valuable asset. Mergen treats it that way.
- **SSH Tunneling**: Securely access production databases without exposing ports to the public internet. Native, encrypted tunneling built-in.
- **Local-First Architecture**: Your connection credentials and queries **never** leave your machine. No cloud sync, no tracking, complete privacy.
- **SSL/TLS Support**: Full support for encrypted database connections.
- **Safe Mode Editing**: Changes in the Data Editor are staged first. Commit only when you're ready, preventing accidental data loss.

### ⚡ **Native Performance**
Forget about loading spinners and laggy inputs.
- **Go Backend**: Powered by a robust Go core for blazing-fast connection handling and query execution.
- **Low Footprint**: Consumes a fraction of the RAM compared to traditional Electron apps.
- **Instant Startup**: Launches in milliseconds, ready when you are.

### 🧠 **Intelligent Workflow**
Work smarter, not harder.
- **Command Palette (`Cmd+K`)**: Navigate anywhere, execute commands, toggle connections, and switch contexts without ever lifting your hands from the keyboard.
- **Multi-Tab Interface**: Juggle multiple queries, table views, and visualizations simultaneously.
- **Smart Autocomplete**: Context-aware SQL suggestions help you write queries faster and with fewer errors.

### 📊 **Data Visualization**
Don't just read data—see it.
- **Instant Charts**: Turn any query result into a visual masterpiece with one click.
- **Rich Chart Types**: Bar, Line, Area, and Pie charts available instantly.
- **Interactive**: Hover, zoom, and explore your data visually to find insights faster.

### 🛠️ **Power User Tools**
- **Data Editor**: A spreadsheet-like interface for quick edits. Double-click to modify, add rows, or delete data.
- **Universal Export**: Export your data to Excel (`.xlsx`), CSV, or JSON formats effortlessly.
- **Query History**: Never lose a complex query again. Access your execution history instantly.

---

## 🥊 Mergen vs. The Rest

Why settle for bloated, expensive tools when you can have perfection?

| Feature | **Mergen** | Electron Apps (TablePlus, DBeaver) | Legacy Tools (Workbench) |
| :--- | :--- | :--- | :--- |
| **RAM Usage** | **~25 MB** (Native) | ~400 MB+ (Chromium) | Varies, often heavy |
| **Startup Time** | **Instant** (< 0.5s) | Sluggish (3s+) | Measured in ages |
| **App Size** | **Tiny** (~15 MB) | Huge (150 MB+) | Bloated |
| **Cost** | **Free & Open Source** | Expensive Subscriptions | Free / Expensive |
| **Privacy** | **100% Local** | Cloud Sync / Telemetry | Varies |
| **UI/UX** | **State of the Art** | Utilitarian / Clunky | Dated, Complex |

**The Truth About Electron:**
Most modern database tools are built on Electron, effectively bundling a whole web browser with every app. This eats your RAM, drains your battery, and slows down your workflow. 

**Mergen is different.** By using Wails, we leverage the native webview already present on your OS. The result? An app that looks better, runs faster, and respects your hardware. Don't pay for bloat. Choose Mergen.

---

## 🛠️ Technology Stack

Built on the shoulders of giants for maximum stability and performance:

| Component | Technology | Why we chose it |
|-----------|------------|-----------------|
| **Core** | [Wails v2](https://wails.io) | The bridge between Go and the web, enabling native performance with web UI flexibility. |
| **Backend** | [Go (Golang)](https://go.dev) | Unmatched concurrency and speed for handling database connections and I/O. |
| **Frontend** | [React](https://reactjs.org) | The industry standard for building dynamic, responsive user interfaces. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | For pixel-perfect, modern, and maintainable styling. |
| **Database** | MySQL / PostgreSQL | First-class support for the world's most popular databases. |

---

## 📥 Installation

### Prerequisites
- **Go**: v1.23 or higher
- **Node.js**: v20 or higher

### Building from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/parevo/mergen.git
   cd mergen
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Run in Development Mode**
   ```bash
   wails dev
   ```

4. **Build for Production**
   ```bash
   wails build
   ```
   The optimized binary will be available in `build/bin/`.

---

## 🔄 Auto-Updates
Mergen respects your time. The built-in updater automatically checks for new releases on GitHub, downloading and applying patches seamlessly so you're always on the cutting edge.

---

## 🤝 Contributing
We believe in the power of open source. Found a bug? Have a feature request?
1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes.
4. Open a Pull Request.

---

## 📄 License
Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ and ☕ by <a href="https://github.com/ahmetbilgay">Ahmet Can Bilgay</a></p>
  <p><i>make something wonderful.</i></p>
</div>
