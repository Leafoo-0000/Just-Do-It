 Here's a comprehensive README for your Just-Do-It project:

```markdown
# 🌱 Just-Do-It

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://just-do-it-five.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

> A personal habit-tracking web application with a sustainability focus. Track your eco-friendly habits, visualize your progress, and build a greener lifestyle—one habit at a time.

![Dashboard Preview](https://via.placeholder.com/800x400/10B981/FFFFFF?text=Just-Do-It+Dashboard)

---

## ✨ Features

### 🎯 Core Functionality
- **Habit Tracking** — Create daily or weekly eco-friendly habits
- **Smart Completion** — Toggle habits with automatic daily/weekly resets
- **Progress Analytics** — Visualize your consistency with interactive charts
- **AI Suggestions** — Get personalized eco-habit recommendations (Beta)
- **Responsive Design** — Works seamlessly on mobile, tablet, and desktop

### 🔐 Authentication & User Management
- Secure email/password authentication via Supabase Auth
- User profiles with sustainability scores
- Protected routes with automatic redirects

### 📊 Data & Analytics
- **Dashboard** — Quick overview of today's habits and key stats
- **Progress Page** — Detailed charts (weekly, monthly, yearly views)
- **My Habits** — Manage all habits with filtering and editing
- **Profile** — View personal stats and account information

### 🎨 UI/UX Highlights
- Clean, modern interface with Tailwind CSS
- Collapsible sidebar with mobile hamburger menu
- Smooth animations and transitions
- Glassmorphism effects on AI suggestions banner
- Real-time stats updates across all pages

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **UI Components** | lucide-react icons |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Charts** | Recharts |
| **Routing** | React Router DOM v6 |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works fine)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Leafoo-0000/Just-Do-It.git
   cd Just-Do-It
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**
   
   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Habits table
   create table habits (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users not null,
     name text not null,
     frequency text check (frequency in ('daily', 'weekly')),
     reminder_enabled boolean default false,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Profiles table
   create table profiles (
     id uuid references auth.users primary key,
     full_name text,
     avatar_initials text,
     sustainability_score integer default 0,
     created_at timestamp with time zone default timezone('utc'::text, now()),
     updated_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Habit logs for historical tracking
   create table habit_logs (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users not null,
     habit_id uuid references habits on delete cascade not null,
     completed_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Function to get habits with completion status
   create or replace function get_habits_with_status(p_user_id uuid)
   returns table (
     id uuid,
     user_id uuid,
     name text,
     frequency text,
     completed boolean,
     reminder_enabled boolean,
     created_at timestamp with time zone
   ) as $$
   begin
     return query
     select 
       h.id,
       h.user_id,
       h.name,
       h.frequency,
       exists (
         select 1 from habit_logs hl 
         where hl.habit_id = h.id 
         and hl.user_id = p_user_id
         and hl.completed_at >= case 
           when h.frequency = 'daily' then current_date::timestamp
           else date_trunc('week', current_date)
         end
       ) as completed,
       h.reminder_enabled,
       h.created_at
     from habits h
     where h.user_id = p_user_id;
   end;
   $$ language plpgsql security definer;

   -- Function to toggle habit completion
   create or replace function toggle_habit_completion(
     p_habit_id uuid,
     p_user_id uuid,
     p_current_status boolean
   ) returns void as $$
   begin
     if p_current_status then
       delete from habit_logs 
       where habit_id = p_habit_id 
       and user_id = p_user_id
       and completed_at >= current_date::timestamp;
     else
       insert into habit_logs (habit_id, user_id, completed_at)
       values (p_habit_id, p_user_id, now());
     end if;
   end;
   $$ language plpgsql security definer;
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AddHabitModal.tsx      # Create new habits
│   ├── EditHabitModal.tsx     # Edit existing habits
│   ├── ProtectedRoute.tsx     # Auth protection with Outlet
│   ├── Sidebar.tsx            # Navigation sidebar (mobile responsive)
│   ├── Layout.tsx             # Main layout with Outlet
│   └── TopNavbar.tsx          # Top navigation bar
├── contexts/
│   └── AuthContext.tsx        # Global auth state
├── hooks/
│   ├── useStats.ts            # Shared stats across pages
│   └── useProgressData.ts     # Progress page data fetching
├── pages/
│   ├── Dashboard.tsx          # Main dashboard
│   ├── MyHabits.tsx           # Habit management + AI suggestions
│   ├── Progress/              # Analytics page
│   │   ├── index.tsx
│   │   ├── components/        # Chart components
│   │   ├── hooks/
│   │   └── types/
│   ├── Profile.tsx            # User profile
│   ├── Login.tsx              # Auth pages
│   └── Signup.tsx
├── lib/
│   └── supabase.ts            # Supabase client
├── types/
│   └── index.ts               # TypeScript types
├── App.tsx                    # Router configuration
└── main.tsx                   # Entry point
```

---

## 🗺 Roadmap

- [x] Authentication system
- [x] Habit CRUD operations
- [x] Daily/weekly habit tracking
- [x] Progress analytics with charts
- [x] Mobile responsive design
- [x] AI suggestions (visual)
- [ ] Real AI-powered habit recommendations
- [ ] Streak freeze/sick day feature
- [ ] Habit categories and tags
- [ ] Push notifications
- [ ] Data export functionality
- [ ] Social features (friend challenges)
- [ ] Dark mode

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend-as-a-service
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the beautiful charts
- [Lucide](https://lucide.dev/) for the crisp icons

---

<p align="center">
  Built with 💚 for a sustainable future
</p>
```

This README includes:
- Badges for tech stack and deployment status
- Feature overview with emojis for visual appeal
- Detailed setup instructions including the SQL schema
- Project structure tree
- Roadmap with checkboxes
- Contributing guidelines
- Professional formatting throughout

You can customize the screenshot placeholder with an actual screenshot of your app once you have one!
