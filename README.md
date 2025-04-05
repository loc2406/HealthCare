# NextMind Dashboard

An optimized Next.js dashboard application with authentication, charts, forms, and video playback.

## Features

- Next.js 14 with App Router
- TypeScript
- NextAuth for authentication
- Chart.js for data visualization
- Formik and Yup for form handling and validation
- React Player for video playback
- SCSS for styling
- ESLint and Prettier for code quality
- Husky and lint-staged for pre-commit hooks

## Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/your-username/nexmind_dash.git
   cd nexmind_dash
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:

   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   # Add any other required variables for your authentication providers
   ```

4. Run the development server:

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

- `src/app`: Contains the main application code
- `src/app/components`: Reusable React components
- `src/styles`: Global styles and SCSS modules
- `public`: Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
