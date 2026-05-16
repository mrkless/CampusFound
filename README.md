# 🎓 CampusFound | Lost & Found Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://campus-found-drab.vercel.app/)

**CampusFound** is a modern, premium web application designed to help students and faculty members reunite with their lost belongings on campus. Built with speed, security, and a stunning UI in mind.

🔗 **[Live Demo](https://campus-found-drab.vercel.app/)**

---

## ✨ Key Features

- 🔐 **Secure Authentication**: Integrated with Supabase Auth for safe user registration and login.
- 🔍 **Lost & Found Items**: Easily report lost items or post found items with descriptions and locations.
- 🖼️ **Image Support**: Upload photos of found items to help owners identify them quickly.
- 👤 **User Profiles**: Manage your postings and profile details in a sleek dashboard.
- 🌓 **Premium Design**: Modern aesthetic with dark mode support, smooth animations (Framer Motion), and a responsive layout.
- 🔔 **Real-time Notifications**: Instant feedback with React Hot Toast.

---

## 🚀 Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrkless/CampusFound.git
   cd CampusFound
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
src/
├── components/     # Reusable UI components (Auth, Items, Layout, etc.)
├── context/        # React context for state management
├── lib/            # External library configurations (Supabase client)
├── pages/          # Main application views (Home, Profile, Login, etc.)
├── assets/         # Static assets (images, icons)
├── App.jsx         # Main App component and routing
└── main.jsx        # Entry point
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Developed with ❤️ by <b>Lester Bucag</b> for the Campus Community
</p>
