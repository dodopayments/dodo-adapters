import { defineApp } from "convex/server";
import dodopayments from "@dodopayments/convex/convex.config.js";

const app = defineApp();
app.use(dodopayments);
export default app;
