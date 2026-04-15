"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-browser";
import { LogOut, Briefcase, LayoutDashboard, Search, Bell } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead, clearReadNotifications } from "@/app/actions";

type Notification = {
  id: string;
  type: "application_update" | "new_candidate";
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
};

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [, startTransition] = useTransition();
  const notifRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const lastPathRef = useRef<string>("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadUser = async () => {
    const {
      data: { user: currentUser },
    } = await supabaseBrowser.auth.getUser();
    setUser(currentUser ?? null);

    if (currentUser) {
      const { data: profileData } = await supabaseBrowser
        .from("profiles")
        .select("id, first_name, role")
        .eq("id", currentUser.id)
        .single();
      setProfile(profileData ?? null);

      // Load notifications
      try {
        const notifs = await getNotifications();
        setNotifications(notifs as Notification[]);
        setNotifError(null);
      } catch (e: any) {
        console.error("[Navbar] getNotifications failed:", e);
        setNotifError(e?.message ?? "Error al cargar notificaciones");
      }
    } else {
      setProfile(null);
      setNotifications([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    loadUser();

    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange(async (event) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadUser();
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setNotifications([]);
        setNotifError(null);
        router.push("/login");
      }
    });

    const handleProfileUpdated = () => {
      if (mounted) loadUser();
    };
    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabaseBrowser
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update the notification with the new read status
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === payload.new.id ? (payload.new as Notification) : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showNotifications) return;
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  // Refresh notifications when navigating to a different page
  useEffect(() => {
    if (pathname !== lastPathRef.current && user) {
      lastPathRef.current = pathname;
      startTransition(async () => {
        try {
          const notifs = await getNotifications();
          setNotifications(notifs as Notification[]);
          setNotifError(null);
        } catch (e: any) {
          console.error("[Navbar] getNotifications failed:", e);
        }
      });
    }
  }, [pathname, user]);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    setProfile(null);
    setNotifications([]);
    setNotifError(null);
    router.push("/login");
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    setShowNotifications(false);
    router.push(notif.link);
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  };

  const handleClearRead = () => {
    startTransition(async () => {
      await clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.read));
    });
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">
          MatchMaker
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <>
              <Link href="/jobs" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Ofertas</span>
              </Link>

              {profile?.role === "recruiter" && (
                <>
                  <Link href="/dashboard/recruiter" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Mis Ofertas</span>
                  </Link>
                  <Link href="/dashboard/recruiter/create" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Nueva Oferta</span>
                  </Link>
                </>
              )}

              {/* Notification Bell */}
              <div
                className="relative"
                ref={notifRef}
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                    closeTimeoutRef.current = null;
                  }
                  setShowNotifications(true);
                }}
                onMouseLeave={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                  }
                  closeTimeoutRef.current = setTimeout(() => {
                    setShowNotifications(false);
                    closeTimeoutRef.current = null;
                  }, 120);
                }}
              >
                <button
                  onClick={() => {
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                    setShowNotifications((v) => !v);
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden"
                    onMouseEnter={() => {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={() => {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                      }
                      closeTimeoutRef.current = setTimeout(() => {
                        setShowNotifications(false);
                        closeTimeoutRef.current = null;
                      }, 120);
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">Notificaciones</span>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                          >
                            Marcar leídas
                          </button>
                        )}
                        {notifications.some((n) => n.read) && (
                          <button
                            onClick={handleClearRead}
                            className="text-xs font-medium text-slate-400 hover:text-rose-500 transition"
                          >
                            Limpiar leídas
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                      {notifError ? (
                        <p className="px-4 py-6 text-center text-xs text-rose-500">
                          Error: {notifError}
                        </p>
                      ) : notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-500">
                          No tienes notificaciones
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left px-4 py-3 transition hover:bg-slate-50 flex items-start gap-3 ${
                              !notif.read ? "bg-emerald-50/60" : ""
                            }`}
                          >
                            <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${notif.read ? "bg-transparent" : "bg-emerald-500"}`} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm leading-snug ${notif.read ? "text-slate-700" : "font-semibold text-slate-900"}`}>
                                {notif.title}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notif.body}</p>
                            </div>
                            <span className="shrink-0 text-xs text-slate-400">{formatTime(notif.created_at)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-l border-slate-200 pl-4 sm:pl-6">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white text-xs font-bold shadow-sm">
                    {profile?.first_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-900">{profile?.first_name || "Usuario"}</span>
                    <span className="text-xs text-slate-500">
                      {profile?.role === "recruiter" ? "Reclutador" : "Candidato"}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-slate-950 px-4 sm:px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
