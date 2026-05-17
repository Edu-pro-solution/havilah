import { useContext, useMemo } from "react";
import { Home, User2, Bell, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth, roleLabels } from "@/contexts/AuthContext";
import { SessionContext } from "@/contexts/SessionContext";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import useFetch from "@/hooks/useFetch";

export function TopHeader() {
  const { user, logout } = useAuth();
  const { currentSession, sessions, setCurrentSession } = useContext(SessionContext);
  const navigate = useNavigate();
  const initials = user?.username?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "U";

  const { data: rawNotices } = useFetch(
    currentSession?._id ? `/get-all-notices/${currentSession._id}` : null
  );
  const notices = useMemo(() => Array.isArray(rawNotices) ? rawNotices as any[] : [], [rawNotices]);
  const unreadCount = notices.length;

  return (
    <header className="sticky top-0 z-30 flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-2 py-2 sm:flex-nowrap sm:gap-3 sm:px-4 sm:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:max-w-[min(100%,28rem)]">
        <SidebarTrigger className="shrink-0" />
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5 sm:gap-2 sm:px-3">
          <p className="min-w-0 truncate text-[11px] font-bold text-foreground sm:text-xs" title={currentSession?.name}>
            <span className="hidden min-[380px]:inline">Session: </span>
            <span className="min-[380px]:hidden">S: </span>
            {currentSession?.name || "Loading..."}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 sm:h-5 sm:w-5">
                <ChevronDown className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              {sessions.map((session) => (
                <DropdownMenuItem key={session._id} onClick={() => setCurrentSession(session)}>
                  {session.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Notifications Popover code remains same... */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-3 border-b">
              <p className="text-sm font-semibold">Notice Board</p>
              <Badge variant="secondary" className="text-[10px]">{unreadCount} notices</Badge>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No notices</p>
              ) : (
                notices.slice(0, 10).map((n: any) => (
                  <div key={n._id} className="px-3 py-2.5 border-b last:border-b-0 hover:bg-muted/50">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold leading-snug line-clamp-2">{n.notice || n.title || "—"}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          By: {n.posted_by || n.postedBy || "Admin"} &bull; {n.date ? new Date(n.date).toLocaleDateString() : n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate(user?.role === "student" ? "/student/dashboard/notices" : "/notices")}>
                View all notices
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 cursor-pointer outline-none group">
              <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-bold leading-tight text-foreground">
                  {user?.name || user?.username || "Guest User"}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] w-fit px-1.5 py-0 bg-primary/10 text-primary border-none font-bold">
                  {user?.role ? (roleLabels[user.role] || user.role) : "User"}
                </Badge>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-2">
            <DropdownMenuLabel className="font-normal px-2 py-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-foreground">{user?.username || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/")}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(user?.role === "student" ? "/student/dashboard/profile" : user?.role === "teacher" ? "/dashboard/profile" : "/profile")}>
              <User2 className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            {user?.role !== "student" && user?.role !== "teacher" && user?.role !== "parent" && (
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
