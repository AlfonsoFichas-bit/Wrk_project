import type { NotificationType } from "@prisma/client";
import { prisma } from "../db.js";

interface NotifyArgs {
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	entityType?: string;
	entityId?: string;
}

/**
 * Crea una notificación para el usuario salvo que sus preferencias la tengan
 * desactivada. Equivalente a `lib/notify.ts` de la API original.
 */
export const notify = async (args: NotifyArgs) => {
	const preference = await prisma.notificationPreference.findUnique({
		where: {
			userId_type: {
				userId: args.userId,
				type: args.type,
			},
		},
	});

	if (preference && !preference.enabled) {
		return null;
	}

	return prisma.notification.create({
		data: {
			userId: args.userId,
			type: args.type,
			title: args.title,
			message: args.message,
			entityType: args.entityType,
			entityId: args.entityId,
		},
	});
};

export default notify;
