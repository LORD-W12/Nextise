const bcrypt = require("bcryptjs");
const envHash = process.env.ADMIN_PASSWORD_HASH;
console.log("ENV ADMIN_PASSWORD_HASH:", JSON.stringify(envHash));
console.log("ENV ADMIN_USERNAME:", JSON.stringify(process.env.ADMIN_USERNAME));

const hardcoded = "$2b$12$AafJaMU.tf0lP69u/JTiyei.F/HYPYwLxnrip0LlnUA2IzuYEq6DK";

async function test() {
    const r1 = await bcrypt.compare("password", hardcoded);
    console.log("Hardcoded hash matches 'password':", r1);

    if (envHash) {
        const r2 = await bcrypt.compare("password", envHash);
        console.log("ENV hash matches 'password':", r2);
    } else {
        console.log("No ADMIN_PASSWORD_HASH env var set — fallback used");
    }
}
test();
