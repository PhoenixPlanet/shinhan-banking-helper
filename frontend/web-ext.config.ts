import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
    chromiumArgs: ['--disable-web-security', '--user-data-dir="C:\temp\ignore-cors"', `--unsafely-treat-insecure-origin-as-secure=${import.meta.env.VITE_API_URL}`, '--ignore-certificate-errors', 'https://bank.shinhan.com'],
});