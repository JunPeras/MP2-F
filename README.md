# 🎓 Salón de Estudio Colaborativo (Ecosistema Completo)

Este es el repositorio central del proyecto **Salón de Estudio Colaborativo en Tiempo Real**, desarrollado como un mini-proyecto académico para la Facultad de Ingeniería. 

La aplicación ofrece un espacio virtual donde los estudiantes pueden estudiar en grupo mediante herramientas de comunicación síncrona como chat, videollamadas y compartición de pantalla. El proyecto completo está compuesto por 3 componentes principales totalmente contenedorizados con Docker.

---

## 🏗️ Repositorios del Proyecto

Para que el sistema funcione correctamente, debes clonar los siguientes 3 repositorios en la misma carpeta raíz de tu máquina local:

* **Frontend (Cliente Web):** [https://github.com/JunPeras/MP2-F.git](https://github.com/JunPeras/MP2-F.git)
* **Backend (API Rest):** [https://github.com/Alexis0521/MP2-B.git](https://github.com/Alexis0521/MP2-B.git)
* **Servidor de WebSockets:** [https://github.com/Alexis0521/MP2-WS.git](https://github.com/Alexis0521/MP2-WS.git)

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React, TypeScript, Tailwind CSS, Vite, WebRTC.
* **Backend & WS:** Node.js, WebSockets (Socket.io / WS).
* **Servicios:** Firebase Authentication, Firestore.
* **Infraestructura:** Docker & Docker Compose.

---

## 🚀 Guía de Instalación y Despliegue

### 1. Clonar los Repositorios
Crea una carpeta para el proyecto y clona los tres componentes uno al lado del otro:

```bash
git clone [https://github.com/JunPeras/MP2-F.git](https://github.com/JunPeras/MP2-F.git)
git clone [https://github.com/Alexis0521/MP2-B.git](https://github.com/Alexis0521/MP2-B.git)
git clone [https://github.com/Alexis0521/MP2-WS.git](https://github.com/Alexis0521/MP2-WS.git)
```

### 2. Configuración de Variables de Entorno (`.env`)
Debes ingresar a cada carpeta, crear un archivo llamado `.env` tomando como base el archivo `.env.example` y rellenar las credenciales correspondientes.

#### 📁 Backend (`MP2-B/.env`)
```env
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_client_email
FIREBASE_PRIVATE_KEY="tu_private_key_completa"
```

#### 📁 Websocket Server (`MP2-WS/.env`)
```env
PORT=4000
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_client_email
FIREBASE_PRIVATE_KEY="tu_private_key_completa"
```

#### 📁 Frontend (`MP2-F/.env`)
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:4000

VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Credenciales para WebRTC (Opcionales para entornos locales, requeridas en producción)
VITE_ICE_SERVER_URL=
VITE_ICE_SERVER_USERNAME=
VITE_ICE_SERVER_CREDENTIAL=
```

---

## 🔑 ¿Cómo obtener estas credenciales?

### A. Credenciales de Firebase (Para el Frontend)
1. Ve a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto.
2. En la sección **Authentication**, activa los métodos de inicio de sesión por **Correo/Contraseña** y **Google**.
3. En la configuración del proyecto (icono de engranaje ⚙️ -> *Configuración del proyecto*), ve a la pestaña **General**.
4. En la parte inferior, añade una **Aplicación Web**.
5. Copia el objeto `firebaseConfig` que te proporciona. De ahí extraerás el `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, etc., para el `.env` del Frontend.

### B. Llave Privada de Firebase Admin SDK (Para Backend y Websockets)
1. En la misma ventana de *Configuración del proyecto*, ve a la pestaña **Cuentas de servicio**.
2. Asegúrate de seleccionar *Node.js* y haz clic en **Generar nueva clave privada**.
3. Se descargará un archivo `.json`. Ábrelo con un editor de texto:
   * `project_id` corresponde a `FIREBASE_PROJECT_ID`.
   * `client_email` corresponds a `FIREBASE_CLIENT_EMAIL`.
   * `private_key` corresponde a `FIREBASE_PRIVATE_KEY`. *Nota: Asegúrate de copiarla con las comillas y mantener los saltos de línea `\n` internos.*

### C. Servidores ICE / STUN / TURN (Para las Videollamadas en Frontend)
* **Para desarrollo local:** Puedes dejarlos vacíos. El navegador por defecto puede resolver las conexiones WebRTC si los dos usuarios están en la misma red o máquina.
* **Para producción/redes distintas:** Necesitas un proveedor de salas de retransmisión. Puedes registrarte gratis en plataformas como **Metered.ca**, **Xirsys** o **Twilio** para obtener URLs de servidores `stun:` o `turn:` junto con sus respectivos usuarios y contraseñas.

---

## 🐳 Despliegue con Docker

Una vez configurados los tres archivos `.env`, el despliegue está centralizado desde la aplicación cliente.

1. Abre tu terminal y posiciónate en la raíz del proyecto **Frontend**:
   ```bash
   cd MP2-F
   ```
2. Ejecuta el comando de Docker para construir y levantar los 3 contenedores en segundo plano:
   ```bash
   docker compose up --build
   ```
3. ¡Listo! Una vez que los contenedores terminen de compilar e iniciar, abre tu navegador web e ingresa a la aplicación en:
   
   👉 **[http://localhost:8080](http://localhost:8080)**

---

## 👥 Características Principales de la Aplicación

* **Autenticación:** Registro e inicio de sesión seguro (Tradicional y Google Auth).
* **Perfiles de Usuario:** Gestión y personalización de información del estudiante.
* **Salas de Estudio:** Creación, unión y administración de salas temáticas.
* **Colaboración en Vivo:** Chat de texto fluido con prima de persistencia de mensajes.
* **Comunicación Síncrona:** Audio, Video y Compartición de Pantalla en tiempo real mediante tecnología WebRTC.
* **Diseño:** Interfaz moderna, intuitiva y *responsive* adaptada a dispositivos móviles y escritorio.