import { createRouter } from "@remix-run/fetch-router";
import todos from "./controllers/todos";
import routes from "../assets/routes";

const router = createRouter({
  defaultHandler() {
    return Response.json({ message: "Not Found" }, { status: 404 });
  },
});

router.map(routes.todos, todos);

export default router;
