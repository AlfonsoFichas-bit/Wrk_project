// Definición de roles de usuario (compatibles con el esquema de Prisma)
export enum UserRole {
	ADMIN = "ADMIN",
	PRODUCT_OWNER = "PRODUCT_OWNER",
	SCRUM_MASTER = "SCRUM_MASTER",
	TEAM_DEVELOPER = "TEAM_DEVELOPER",
}

// Tipo para un usuario (compatible con el esquema de Prisma)
export interface User {
	id: string;
	email: string;
	name: string;
	password: string; // Este campo se usa en operaciones de autenticación
	role: UserRole;
	avatar?: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
	// Campos relacionados que pueden no estar incluidos inicialmente
	projects?: Project[];
	tasks?: Task[];
}

// Tipos de role para uso en contextos específicos
export type GeneralRole =
	| "ADMIN"
	| "PRODUCT_OWNER"
	| "SCRUM_MASTER"
	| "TEAM_DEVELOPER";
export type ProjectRole = "PRODUCT_OWNER" | "SCRUM_MASTER" | "TEAM_DEVELOPER";

// Interfaces para evitar dependencias circulares
export interface Project {
	id: string;
	name: string;
	description?: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	ownerId: string;
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	projectId: string;
	assigneeId?: string;
}
