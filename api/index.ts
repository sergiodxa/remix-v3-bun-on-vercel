import router from "../server/router";

export default {
  async fetch(request: Request) {
    console.info("%s %s", request.method, request.url);
    return router.fetch(request);
  },
};
