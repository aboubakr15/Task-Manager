# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Install Prisma CLI
RUN npm install -g prisma

# Copy package.json and lock file
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Rebuild Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Use a minimal image for production
FROM node:20-alpine AS runner
WORKDIR /app

# Copy from build stage
COPY --from=deps /app /app

# Set environment variables if needed
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET=qwe8d4s8d12312dnisn1232w0qewj
ENV DATABASE_URL=mysql://uj3ev82ndrjlvslz:mJz9yPNVJba1doasBRjo@b23zx6igll6kcgu9rghe-mysql.services.clever-cloud.com:3306/b23zx6igll6kcgu9rghe

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
