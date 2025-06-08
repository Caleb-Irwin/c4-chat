import { query } from "./_generated/server";

export const helloWorld = query({
    handler: () => {
        return "Hello, world!";
    },
});