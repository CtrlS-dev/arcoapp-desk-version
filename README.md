# Arco App 🏹

**Arco App** es una aplicación de escritorio minimalista construida con Electron y React para monitorear las tasas oficiales del **Banco Central de Venezuela (BCV)** en tiempo real.

![Interfaz de Arco App](public/arco-logo.png)

## 📥 Descarga la App

¡Obtén la última versión para Windows!

[**👉 Descargar Arco App para Windows**](https://github.com/CtrlS-dev/arcoapp-desk/releases/latest)

> **Nota de instalación:** Al descargar el instalador (`.exe`), Windows podría mostrar una advertencia como "Windows protegió su PC". Esto es normal en aplicaciones nuevas no firmadas. Para instalar:
> 1. Haz clic en **"Más información"**.
> 2. Haz clic en **"Ejecutar de todas formas"**.

## ✨ Características

- 🕒 **Actualizaciones en tiempo real:** Mantente informado con las últimas tasas del BCV y Paralelo.
- 📂 **Segundo Plano:** Se ejecuta silenciosamente en la bandeja del sistema (System Tray).
- 🔔 **Notificaciones:** Recibe alertas discretas.
- 🚀 **Inicio automático:** Opción para iniciar junto con Windows.
- 🎨 **Diseño minimalista:** Interfaz limpia, oscura y sin distracciones.

## 🛠️ Stack Tecnológico

- **Frontend:** React, Tailwind CSS, Framer Motion.
- **Desktop:** Electron.
- **Build Tool:** Vite.

---

## 💻 Para Desarrolladores

Si deseas contribuir o ejecutar el proyecto localmente:

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v16 o superior)
- [npm](https://www.npmjs.com/)

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/CtrlS-dev/arcoapp-desk.git
   cd arcoapp-desk
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz (puedes copiar el ejemplo):
   ```env
   VITE_API_URL=https://api.dolarvzla.com/public/exchange-rate
   ```

4. Corre el proyecto en modo desarrollo:
   ```bash
   npm run electron:dev
   ```

### Compilar para Producción

Para crear el instalador de Windows:
```bash
npm run electron:build
```
Los archivos generados estarán en la carpeta `dist-electron/`.

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
