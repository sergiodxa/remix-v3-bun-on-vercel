import { createRouter } from "@remix-run/fetch-router";
import routes from "../assets/routes";
import todos from "../server/controllers/todos";

const router = createRouter({
  defaultHandler() {
    return Response.json({ message: "Not Found" }, { status: 404 });
  },
});

router.map(routes.todos, todos);

export default {
  async fetch(request: Request) {
    console.info("%s %s", request.method, request.url);
    return router.fetch(request);
  },
};
