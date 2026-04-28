const fs = require("fs");
const path = require("path");

const stripeIndex = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "@stripe",
  "stripe-react-native",
  "src",
  "index.tsx"
);
const stripePackage = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "@stripe",
  "stripe-react-native",
  "package.json"
);

if (fs.existsSync(stripePackage)) {
  const packageJson = JSON.parse(fs.readFileSync(stripePackage, "utf8"));
  let changed = false;

  if (packageJson["react-native"] !== "lib/commonjs/index.js") {
    packageJson["react-native"] = "lib/commonjs/index.js";
    changed = true;
  }

  if (packageJson.source !== "lib/commonjs/index.js") {
    packageJson.source = "lib/commonjs/index.js";
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(stripePackage, `${JSON.stringify(packageJson, null, 2)}\n`);
    console.log("Patched @stripe/stripe-react-native package entry for Metro.");
  }
}

if (!fs.existsSync(stripeIndex)) {
  process.exit(0);
}

const source = fs.readFileSync(stripeIndex, "utf8");
const replacements = [
  ["export * from './types/index';", "export type * from './types/index';"],
  [
    "export * from './types/EmbeddedPaymentElement';",
    "export type * from './types/EmbeddedPaymentElement';"
  ],
  ["export * from './types/PaymentSheet';", "export type * from './types/PaymentSheet';"]
];

const patched = replacements.reduce(
  (current, [from, to]) => current.replace(from, to),
  source
);

if (patched !== source) {
  fs.writeFileSync(stripeIndex, patched);
  console.log("Patched @stripe/stripe-react-native type-only export for Metro.");
}
