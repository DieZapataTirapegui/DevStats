import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-10 h-10 rounded-full border-2 border-indigo-500"
              />
            )}
            <div>
              <h1 className="text-white font-bold">@{user?.username}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center">
          <p className="text-slate-400">Dashboard en construcción 🚧</p>
        </div>
      </div>
    </div>
  );
}