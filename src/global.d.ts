// Ambient declaration so TypeScript accepts global stylesheet side-effect
// imports like `import "./globals.css"` (fixes TS2882). CSS Modules
// (`*.module.css`) keep their typed declarations from Next — that pattern is
// more specific, so it still takes precedence over this one.
declare module "*.css";
