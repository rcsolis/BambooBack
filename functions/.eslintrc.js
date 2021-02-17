module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "google",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: [
        "/lib/**/*", // Ignore built files.
    ],
    plugins: ["@typescript-eslint", "import"],
    rules: {
        "max-len": ["error", { code: 85 }],
        "no-unused-vars": [
            "warn",
            {
                vars: "all",
                args: "after-used",
                ignoreRestSiblings: false,
            },
        ],
        "quotes": ["error", "double"],
        "indent": ["error", 4],
        "object-curly-spacing": ["error", "always"],
        "new-cap": [
            "error",
            {
                newIsCap: false,
                capIsNew: false,
            },
        ],
        "require-jsdoc": [
            "error",
            {
                require: {
                    FunctionDeclaration: false,
                    MethodDefinition: false,
                    ClassDeclaration: false,
                    ArrowFunctionExpression: false,
                    FunctionExpression: false,
                },
            },
        ],
    },
};
