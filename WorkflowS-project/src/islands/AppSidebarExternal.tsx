import type React from "react";
import type { UserRole } from "@/models/user";
import { AppLogo } from "../components/AppLogo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../components/ui/sidebar";
import NavFooterExternal from "./NavFooterExternal";
import NavMain from "./NavMain";
import NavUser from "./NavUser";

interface AppSidebarExternalProps {
	userRole?: UserRole;
}

export default function AppSidebarExternal({
	userRole,
}: AppSidebarExternalProps = {}): React.ReactElement {
	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton>
							<a href="/welcome" className="flex items-center w-full">
								<AppLogo />
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavMain userRole={userRole} />
			</SidebarContent>

			<SidebarFooter>
				<NavFooterExternal className="mt-auto" />
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
