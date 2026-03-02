# 🚀 Pet Care App – Frontend

## 📌 Project Title  
**Pet Care Management System – Frontend**

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss)
![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-Component_Library-black)

The **Pet Care Management** System is a full-stack web application designed to help pet owners efficiently manage their pets' daily activities, health records, and appointments.

This repository contains the **frontend** of the application. It provides a modern, responsive, and user-friendly interface built using React and Tailwind CSS. The system supports two roles: **Admin** and **User**, with role-based access control.
---

## 🎥 Video Walkthrough
[Watch the demo here](https://drive.google.com/file/d/1mLhTcYFimNPbl8jiKAKN79_Pc-zqAcvE/view?usp=sharing)

---

## 🚀 Live Demo

🌐 Frontend: https://pet-care-client-fawn.vercel.app/  
🔗 Backend API: https://pet-care-server-f3zr.onrender.com  

---

## ✨ Features  

### 👤 User Features
- User authentication (Signup/Login)
- Add, edit, and delete pets
- Track daily activities (walking, feeding, medication, etc.)
- Manage appointments
- Manage vaccinations 
- View pet activity history
- Responsive dashboard UI
- Subscribe to insurace policies
- Get AI diet suggestions
- Share posts
- Create play dates for pets

### 🛠️ Admin Features
- View number of users
- Create insurance polycies
- Approve user subscribed polycies

---

# 🛠 Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- Axios
- React Router DOM
- React Toastify
- Lucide Icons
- Shadcn UI
- Recharts

---

# 📂 Project Structure

```
src/
 ├── components/
 ├── context/
 ├── pages/
 ├── services/
 ├── App.jsx
 └── main.jsx
public/
vite.config.js
package.json
.env

```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone "https://github.com/jallurividya/pet-care-client.git"
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Start Development Server

```bash
npm run dev
```

App runs on:

Default base URL:

```
http://localhost:5173
```
For production (deployed frontend):

```
https://pet-care-client-fawn.vercel.app/
```
---

# 🌐 Backend Integration

This frontend connects to a backend API.

Default base URL:

```
http://localhost:7777
```

For production (deployed backend):

```
https://pet-care-server-f3zr.onrender.com
```


Located in:

```
src/services/api.js
```

---

# 🔐 Environment Variables (Recommended)

Create a `.env` file in the root:

## Local development

```
VITE_API_URL=http://localhost:7777
```

## Production (Vercel)
VITE_API_URL=https://pet-care-server-f3zr.onrender.com

Update `api.js`:

```js
baseURL: import.meta.env.VITE_API_URL
```

---

# 🏗 Production Build

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# 🚀 Deployment

You can deploy this frontend on Render:

1. Connect your GitHub repository to Render.
2. Set the build command: `npm run build`
3. Set the publish directory: `dist`
4. Add environment variable: `VITE_API_URL=https://pet-care-server-f3zr.onrender.com`
5. Trigger deploy.

---

# 🧠 Architecture Highlights

- JWT stored in localStorage
- Axios interceptors attach tokens automatically
- Protected & RoleProtected Routes
- Centralized API service
- Responsive mobile-first design
- Auto-refresh mechanism

---

# 🔮 Future Improvements

- Sending email notifications
- Booking vet appointments

---

# 👨‍💻 Author

** Vidya Sai Mounika Jalluri **  
Full Stack Web Developer  
Email: jallurividya2002@gmail.com  
GitHub: https://github.com/jallurividya

---

⭐ If you found this project helpful, consider giving it a star!
