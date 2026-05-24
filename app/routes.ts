import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  route("memories/:id?", "routes/memories.tsx"),
  route("memories/delete/:id", "routes/memories.delete.tsx"),
] satisfies RouteConfig;
