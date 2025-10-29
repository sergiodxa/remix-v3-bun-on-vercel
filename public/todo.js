import { z } from "zod";

export const TodoSchema = z.object({
	id: z.uuid(),

	title: z.string().min(1).max(255),
	completedAt: z.iso.datetime().nullable(),

	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

/** @typedef {z.infer<typeof TodoSchema>} Todo */
