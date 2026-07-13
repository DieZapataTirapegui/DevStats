import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  UserCheck,
  Star,
  GitFork,
  RefreshCw,
  LogOut,
  ExternalLink,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getOverview, clearCache } from "../services/stats.service";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  PHP: "#4F5D95",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Blade: "#f7523f",
  default: "#6366f1",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function Dashboard() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["stats-overview"],
    queryFn: getOverview,
  });

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleRefresh = async () => {
    await clearCache();
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Error al cargar estadísticas</p>
          <button
            onClick={() => refetch()}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const langData = data?.topLanguages.map((l) => ({
    name: l.name,
    value: l.percentage,
    color: LANG_COLORS[l.name] ?? LANG_COLORS.default,
  }));

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">DS</span>
            </div>
            <span className="text-white font-bold">DevStats</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors text-sm disabled:opacity-50"
              title="Refrescar datos"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
              Actualizar
            </button>

            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full border-2 border-indigo-500"
              />
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors text-sm"
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 mb-10"
        >
          <img
            src={data?.profile.avatarUrl}
            alt={data?.profile.username}
            className="w-20 h-20 rounded-2xl border-2 border-indigo-500 shadow-lg shadow-indigo-500/20"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {data?.profile.name}
            </h1>
            <p className="text-slate-400 text-sm">@{data?.profile.username}</p>
            {data?.profile.bio && (
              <p className="text-slate-400 text-sm mt-1">{data.profile.bio}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Calendar size={12} className="text-slate-500" />
              <span className="text-slate-500 text-xs">
                En GitHub desde {data?.profile.memberSince}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Repositorios",
              value: data?.totalRepos,
              icon: BookOpen,
              color: "text-indigo-400",
              bg: "bg-indigo-500/10 border-indigo-500/20",
            },
            {
              label: "Repos públicos",
              value: data?.profile.publicRepos,
              icon: BookOpen,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              label: "Seguidores",
              value: data?.profile.followers,
              icon: Users,
              color: "text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
            {
              label: "Siguiendo",
              value: data?.profile.following,
              icon: UserCheck,
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className={`flex flex-col gap-3 p-5 rounded-2xl border ${stat.bg}`}
            >
              <stat.icon size={18} className={stat.color} />
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Lenguajes */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
          >
            <h2 className="text-white font-bold mb-6">Top Lenguajes</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={langData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {langData?.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, "Uso"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top repos */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
          >
            <h2 className="text-white font-bold mb-4">Top Repositorios</h2>
            <div className="space-y-3">
              {data?.topRepos.slice(0, 5).map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-700/40 border border-slate-700/30 hover:border-slate-600/50 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors">
                        {repo.name}
                      </p>
                      <ExternalLink size={11} className="text-slate-500 shrink-0" />
                    </div>
                    {repo.language && (
                      <span
                        className="text-xs mt-0.5 inline-block"
                        style={{
                          color: LANG_COLORS[repo.language] ?? LANG_COLORS.default,
                        }}
                      >
                        {repo.language}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Star size={11} />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <GitFork size={11} />
                      {repo.forks}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}