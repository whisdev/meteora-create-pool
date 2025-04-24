import helmet from "helmet";

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 3153600,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "no-referrer" },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  dnsPrefetchControl: { allow: false },
});
