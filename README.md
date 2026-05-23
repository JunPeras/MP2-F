# 🚀 Proyecto con React + TypeScript + Tailwind CSS

Este proyecto está creado con React, TypeScript y Tailwind CSS.  
La idea es tener una base moderna, rápida y fácil de usar para empezar a desarrollar sin perder tiempo configurando todo desde cero.

---

# 📦 Instalación

Podés trabajar de dos maneras:

- Usando Node.js
- Usando Docker

---

# 💻 Opción 1: Usando Node.js

## Instalar dependencias

```bash
npm install
```

## Iniciar el proyecto

```bash
npm run dev
```

Abrí en el navegador:

```txt
http://localhost:5173
```

Cada cambio que hagás en el código se actualizará automáticamente.

---

# 🐳 Opción 2: Usando Docker

Si no querés instalar Node.js localmente, podés trabajar directamente con Docker.

## Iniciar el entorno de desarrollo

```bash
docker-compose up dev
```

Abrí en el navegador:

```txt
http://localhost:5173
```

---

# 🛠 Generar versión de producción

## Con Node.js

```bash
npm run build
```

La versión final del proyecto se genera en:

```txt
dist/
```

---

## Con Docker

```bash
docker build -f Dockerfile -t react-app:latest .
```

---

# 👀 Vista previa de producción

## Local

```bash
npm run preview
```

---

## Docker

```bash
docker-compose up prod
```

Disponible en:

```txt
http://localhost:5000
```

---

# 🧹 Revisar el código

## Local

```bash
npm run lint
```

## Docker

```bash
docker-compose exec dev npm run lint
```

---

# 📁 Estructura del proyecto

```txt
.
├── src/                # Código principal
├── public/             # Archivos públicos
├── package.json        # Dependencias y scripts
├── vite.config.ts      # Configuración de Vite
├── tailwind.config.js  # Configuración de Tailwind
├── Dockerfile          # Imagen de producción
├── Dockerfile.dev      # Entorno de desarrollo
└── docker-compose.yml  # Configuración de contenedores
```

---

# 🛠 Tecnologías utilizadas

- React
- TypeScript
- Tailwind CSS
- Vite
- ESLint
- Docker

---

# 📜 Scripts principales

## Iniciar proyecto

```bash
npm run dev
```

## Generar build

```bash
npm run build
```

## Vista previa de producción

```bash
npm run preview
```

## Revisar errores de código

```bash
npm run lint
```

---

# 🐳 Comandos útiles de Docker

## Desarrollo

```bash
docker-compose up dev
```

## Producción

```bash
docker-compose up prod
```

## Detener contenedores

```bash
docker-compose down
```

## Construir imágenes

```bash
docker-compose build
```

---

# ✅ Primeros pasos

1. Cloná o descargá el repositorio
2. Instalá dependencias o iniciá Docker
3. Ejecutá el proyecto
4. Empezá a modificar `src/App.tsx`

---

¡Y listo! 🚀