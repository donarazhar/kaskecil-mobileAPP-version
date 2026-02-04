module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            "nativewind/babel",
            ["module:react-native-dotenv", {
                moduleName: "@env",
                path: process.env.APP_ENV === "production" ? ".env.production" : ".env",
                safe: false,
                allowUndefined: true
            }]
        ],
    };
};
