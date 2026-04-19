# WattSense Admin Dashboard – Dev Server Notes

This project uses **Next.js App Router**.

## Running the dev server

Only **one** Next.js dev server should run at a time. If you see errors like:

- `Unable to acquire lock .next/dev/lock`

then:

1. **Stop all running dev servers**
   - Close all terminals running `pnpm dev`
   - Or press <kbd>Ctrl</kbd> + <kbd>C</kbd> in the terminal

2. **Kill stray Node processes** (if needed)
   - On macOS / Linux: `pkill node`
   - On Windows (PowerShell): `Get-Process node | Stop-Process`

3. **Clean the Next.js build output** (optional but safe)
   - Delete the `.next` folder at the project root

4. **Start a single dev server**
   - From the project root, run:

   ```bash
   pnpm dev
   ```

Keep exactly **one** `pnpm dev` process running for a stable development experience.

