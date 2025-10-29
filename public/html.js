import htm from "htm";
import { jsx } from "@remix-run/dom/jsx-runtime";

export default htm.bind((type, props, ...children) => {
  return jsx(type, { ...props, children }, props?.key);
});
