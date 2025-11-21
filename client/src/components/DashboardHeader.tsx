import { BarChart3, Plus, Settings, Moon, Sun, LogIn, UserPlus, LogOut } from "lucide-react"; // Added LogIn, UserPlus, LogOut
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth"; // New import
import { Link } from "wouter"; // New import

interface DashboardHeaderProps {
  onAddData: () => void;
}

export default function DashboardHeader({ onAddData }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, isLoggedIn, logout } = useAuth(); // Use auth hook

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-wrap items-center justify-between px-6 gap-4"> {/* Added flex-wrap, removed h-16 */}
        <div className="flex items-center gap-3 min-w-0"> {/* Added min-w-0 */}
          <Link href="/">
            <BarChart3 className="w-8 h-8 text-primary cursor-pointer" />
          </Link>
          <div className="min-w-0"> {/* Added min-w-0 */}
            <h1 className="text-xl font-bold truncate" data-testid="text-app-title">Business Analytics</h1> {/* Added truncate */}
            <p className="text-xs text-muted-foreground truncate">AI-Powered Insights</p> {/* Added truncate */}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0"> {/* Added min-w-0 */}
          {isLoggedIn && (
            <Button onClick={onAddData} data-testid="button-add-data">
              <Plus className="w-4 h-4 mr-2" />
              Add Data
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full" data-testid="button-user-menu">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {isLoggedIn ? user?.username.charAt(0).toUpperCase() : "GU"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoggedIn ? (
                <>
                  <DropdownMenuItem className="font-medium">
                    {user?.username}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="menu-item-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} data-testid="menu-item-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <DropdownMenuItem data-testid="menu-item-login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/register">
                    <DropdownMenuItem data-testid="menu-item-register">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}