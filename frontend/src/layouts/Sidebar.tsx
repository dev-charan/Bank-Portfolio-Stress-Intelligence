import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Database,
  Settings,
  ChevronRight,
  BarChart3,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavGroup } from "@/types/navigation.types";

// Navigation Configuration
const navigationGroups: NavGroup[] = [
  {
    title: "Analytics",
    items: [
      {
        title: "Overview",
        href: "/",
        icon: LayoutDashboard,
        description: "Executive dashboard",
      },
      {
        title: "Banks",
        href: "/banks",
        icon: Building2,
        description: "Bank analytics & rankings",
      },
      {
        title: "Trends",
        href: "/trends",
        icon: TrendingUp,
        description: "Cross-bank comparison",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Data",
        href: "/data",
        icon: Database,
        description: "Upload & manage cycles",
      },
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
        description: "Generate reports",
        disabled: true,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Model configuration",
      },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg font-bold shadow-sm">
                🏦
              </div>
              {state === "expanded" && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">
                    Bank Risk
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">
                    Intelligence Platform
                  </span>
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {group.title && state === "expanded" && (
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        disabled={item.disabled}
                        tooltip={item.title}
                      >
                        <Link
                          to={item.href}
                          className="flex items-center gap-3"
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>
                            {state === "expanded" && item.description && (
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {isActive && state === "expanded" && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="" alt="Admin User" />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-semibold">
                      AU
                    </AvatarFallback>
                  </Avatar>
                  {state === "expanded" && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Admin User</span>
                      <span className="truncate text-xs text-muted-foreground">
                        admin@bank.com
                      </span>
                    </div>
                  )}
                  <ChevronRight className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                side="top"
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Admin User
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@bank.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
