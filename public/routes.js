import { resources, route } from "@remix-run/fetch-router";

export default route({
  todos: resources("api/todos", {
    only: ["index", "show", "create", "update", "destroy"],
  }),
});
