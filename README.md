# Error Code Reference - pSEO Project

A professional Next.js 15+ pSEO (programmatic SEO) project featuring a comprehensive reference for HTTP status codes and cloud provider error codes (AWS, Azure, GCP).

## Features

- **Next.js 15+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Dark Developer Theme** with modern UI
- **Dynamic Routes** for `/errors/[provider]/[code]`
- **SEO Optimized** with metadata API and structured data
- **Syntax Highlighting** for code examples
- **Responsive Design** for all devices

## Prerequisites

Before you begin, make sure you have Node.js installed on your system. If you don't have it installed:

1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Install the LTS (Long Term Support) version
3. Verify installation by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```

## Getting Started

Follow these exact commands in your terminal to get the site running on your local machine:

### Step 1: Install Dependencies

Open your terminal in the project folder (`error-project`) and run:

```bash
npm install
```

This will install all the required packages including Next.js, React, TypeScript, Tailwind CSS, and other dependencies.

### Step 2: Start the Development Server

Once dependencies are installed, start the development server:

```bash
npm run dev
```

### Step 3: Open in Browser

After running the command above, you should see output like:

```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Ready in Xs
```

Open your web browser and navigate to:

```
http://localhost:3000
```

You should now see your Error Code Reference website running locally!

## Available Commands

- `npm run dev` - Start the development server (use this to view the site)
- `npm run build` - Build the project for production
- `npm run start` - Start the production server (after building)
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
error-project/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   └── errors/             # Error code pages
│       ├── [provider]/     # Dynamic provider route
│       │   └── [code]/     # Dynamic code route
│       └── page.tsx        # Error codes index
├── components/             # React components
│   ├── ErrorPage.tsx       # Error page display
│   ├── CodeBlock.tsx       # Code syntax highlighter
│   └── Navigation.tsx      # Site navigation
├── lib/                    # Utility functions
│   ├── errors.ts           # Error code data
│   ├── seo.ts              # SEO utilities
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

## Adding More Error Codes

To add more error codes, edit the `lib/errors.ts` file. The structure for each error includes:

- `code`: The error code (e.g., "404", "AccessDenied")
- `name`: Human-readable name
- `description`: Detailed explanation
- `causes`: Array of common causes
- `solutions`: Array of solutions
- `codeExamples`: Code examples with syntax highlighting
- `relatedCodes`: Related error codes

## Customization

- **Theme Colors**: Edit `tailwind.config.ts` to change color scheme
- **Global Styles**: Modify `app/globals.css` for custom styling
- **SEO Settings**: Update `lib/seo.ts` and `app/layout.tsx` for SEO configuration
- **Site URL**: Replace `https://yoursite.com` with your actual domain in `lib/seo.ts`

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Next.js will automatically try the next available port (3001, 3002, etc.). Check the terminal output for the actual port number.

### Module Not Found Errors

If you see module not found errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

If you encounter build errors, make sure all dependencies are installed:
```bash
npm install
```

## Next Steps

1. Add more error codes to `lib/errors.ts`
2. Customize the theme colors in `tailwind.config.ts`
3. Update SEO metadata with your site information
4. Deploy to production (Vercel is recommended for Next.js)

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)


