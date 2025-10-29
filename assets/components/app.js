import { press } from "@remix-run/events/press";
import TodosClient from "../clients/todo.js";
import { TodoForm } from "./todo-form.js";
import { SearchForm } from "./search-form.js";
import { TodoList } from "./todo-list.js";
import html from "../html.js";

/** @this {import("@remix-run/dom").Remix.Handle<TodosClient>} */
export function App() {
  const model = new TodosClient(this.signal);
  this.context.set(model);

  this.queueTask(() => model.list());

  return () => html`
    <main class="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <div class="mx-auto max-w-2xl p-6">
        <header class="flex items-center justify-between gap-4">
          <h1 class="text-2xl font-semibold tracking-tight">Todo App</h1>
          <div class="flex items-center gap-2">
            <${SearchForm} />
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              on=${[press(() => model.list())]}
            >
              Refresh
            </button>
          </div>
        </header>
        <${TodoForm} />
        <${TodoList} />
      </div>
    </main>
  `;
}
