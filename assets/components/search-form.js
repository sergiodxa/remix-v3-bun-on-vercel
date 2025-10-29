import { dom } from "@remix-run/events";
import { App } from "./app.js";
import html from "../html.js";

/** @this {import("@remix-run/dom").Remix.Handle} */
export function SearchForm() {
  const model = this.context.get(App);

  /** @type {"idle" | "submitting"} */
  let status = "idle";

  return () => html`
    <form
      class="flex items-center gap-2"
      method="GET"
      on=${[
        dom.submit(async (event, signal) => {
          event.preventDefault();

          status = "submitting";
          this.update();

          let formData = new FormData(event.currentTarget);
          let query = formData.get("q");
          await model.list(
            { query: (query || "").trim(), page: 1, perPage: 10 },
            signal,
          );

          status = "idle";
          this.update();
        }),
      ]}
    >
      <input
        class="rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-400"
        type="search"
        name="q"
        placeholder="Search"
        disabled=${status === "submitting"}
        on=${[dom.blur((event) => event.currentTarget.form?.requestSubmit())]}
      />
      <button
        class="inline-flex items-center justify-center rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled=${status === "submitting"}
      >
        Search
      </button>
    </form>
  `;
}
