export interface AuthUser {
	userId: string;
	email: string;
	role: string;
	tokenVersion: number;
}

export interface ProjectMembership {
	id: string;
	role: string;
	projectId: string;
	userId: string;
}

export type AppEnv = {
	Variables: {
		user: AuthUser;
		projectMembership: ProjectMembership;
	};
};
