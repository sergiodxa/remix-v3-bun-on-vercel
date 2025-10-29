import { createEventType } from "@remix-run/events";
import routes from "../routes.js";
import { TodoSchema } from "../todo.js";

/** @typedef {import("../todo.js").Todo} Todo */
/** @typedef {import("@remix-run/events").createEventType} createEventType */
/** @typedef {Record<"count" | "pages", number>} PaginationInfo */

/** @type {ReturnType<typeof createEventType<{ todos: Todo[] }>>} */
const [todosFetched, createTodosFetched] = createEventType("todos:fetched");

/** @type {ReturnType<typeof createEventType<{ todo: Todo }>>} */
const [todosCreated, createTodosCreated] = createEventType("todos:created");

/** @type {ReturnType<typeof createEventType<{ todo: Todo }>>} */
const [todoFetched, createTodoFetched] = createEventType("todo:fetched");

/** @type {ReturnType<typeof createEventType<{ todo: Todo }>>} */
const [todoUpdated, createTodoUpdated] = createEventType("todo:updated");

/** @type {ReturnType<typeof createEventType<Pick<Todo, "id">>>} */
const [todoDeleted, createTodoDeleted] = createEventType("todo:deleted");

/** @type {ReturnType<typeof createEventType<PaginationInfo>>} */
const [paginationInfo, createPaginationInfo] =
	createEventType("pagination:info");

export default class TodosClient extends EventTarget {
	/** @type {AbortSignal} */
	#signal;

	/** @param {AbortSignal} signal */
	constructor(signal) {
		super();
		this.#signal = signal;
	}

	/**
	 * @param {string} [id]
	 * @param {string} [q]
	 * @param {AbortSignal} [signal]
	 * @returns
	 */
	fetch(id, q, signal) {
		if (id) return this.show(id, signal);
		return this.list({ query: q }, signal);
	}

	/**
	 *
	 * @param {{
	 *   query?: string,
	 *   page?: number,
	 *   perPage?: number,
	 * }} [options]
	 * @param {AbortSignal} [signal]
	 */
	async list({ query, page = 1, perPage = 10 } = {}, signal) {
		let url = new URL(routes.todos.index.href(), location.href);
		let searchParams = new URLSearchParams();

		if (query && query.trim()) searchParams.set("q", query.trim());
		searchParams.set("page", page?.toString() ?? "1");
		searchParams.set("per_page", perPage?.toString() ?? "10");
		if (searchParams.toString()) url.search = searchParams.toString();

		let mergedSignal = signal
			? AbortSignal.any([this.#signal, signal])
			: this.#signal;

		let response = await fetch(url, { signal: mergedSignal });

		let body = await response.json();
		let todos = TodoSchema.array().parse(body);

		let count = parseInt(response.headers.get("X-Total-Count") || "0", 10);
		let pages = parseInt(response.headers.get("X-Total-Pages") || "0", 10);

		this.dispatchEvent(createTodosFetched({ detail: { todos } }));
		this.dispatchEvent(createPaginationInfo({ detail: { count, pages } }));
	}

	/**
	 * @param {string} id
	 * @param {AbortSignal} [signal]
	 */
	async show(id, signal) {
		let mergedSignal = signal
			? AbortSignal.any([this.#signal, signal])
			: this.#signal;

		let response = await fetch(routes.todos.show.href({ id }), {
			signal: mergedSignal,
		});

		let body = await response.json();
		let todo = TodoSchema.parse(body);

		this.dispatchEvent(createTodoFetched({ detail: { todo } }));
	}

	/**
	 * @param {string} title
	 * @param {AbortSignal} [signal]
	 */
	async create(title, signal) {
		let formData = new FormData();
		formData.append("title", title);

		let mergedSignal = signal
			? AbortSignal.any([this.#signal, signal])
			: this.#signal;

		let response = await fetch(routes.todos.create.href(), {
			method: "POST",
			body: formData,
			signal: mergedSignal,
		});

		let body = await response.json();
		let todo = TodoSchema.parse(body.data);

		this.dispatchEvent(createTodosCreated({ detail: { todo } }));
	}

	/**
	 *
	 * @param {string} id
	 * @param {Partial<Pick<Todo, "title" | "completedAt">>} data
	 * @param {AbortSignal} [signal]
	 */
	async update(id, data, signal) {
		let formData = new FormData();
		if (data.title) formData.append("title", data.title);

		if (data.completedAt !== undefined) {
			formData.append("completedAt", data.completedAt ?? "null");
		}

		let mergedSignal = signal
			? AbortSignal.any([this.#signal, signal])
			: this.#signal;

		let response = await fetch(routes.todos.update.href({ id }), {
			method: "PUT",
			body: formData,
			signal: mergedSignal,
		});

		let body = await response.json();
		let todo = TodoSchema.parse(body);

		this.dispatchEvent(createTodoUpdated({ detail: { todo: todo } }));
	}

	/**
	 * @param {string} title
	 * @param {AbortSignal} [signal]
	 */
	async destroy(id, signal) {
		let mergedSignal = signal
			? AbortSignal.any([this.#signal, signal])
			: this.#signal;

		await fetch(routes.todos.destroy.href({ id }), {
			method: "DELETE",
			signal: mergedSignal,
		});

		this.dispatchEvent(createTodoDeleted({ detail: { id } }));
	}

	/**
	 * @param {string} title
	 * @param {AbortSignal} [signal]
	 */
	async uncomplete(id, signal) {
		await this.update(id, { completedAt: null }, signal);
	}

	/**
	 * @param {string} title
	 * @param {AbortSignal} [signal]
	 */
	async complete(id, signal) {
		await this.update(id, { completedAt: new Date().toISOString() }, signal);
	}

	static todosFetched = todosFetched;
	static todosCreated = todosCreated;
	static todoFetched = todoFetched;
	static todoUpdated = todoUpdated;
	static todoDeleted = todoDeleted;
	static paginationInfo = paginationInfo;
}
