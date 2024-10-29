FROM node:18.20

# Set the build-time arguments and environment variables
ARG PORT=3000
ARG DATABASE_URL
ARG SESSION_SECRET_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_MIXPANEL_TOKEN
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ENV DATABASE_URL=${DATABASE_URL}
ENV SESSION_SECRET_KEY=${SESSION_SECRET_KEY}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
ENV UNSPLASH_API_KEY=${UNSPLASH_API_KEY}
ENV WEATHER_API_KEY=${WEATHER_API_KEY}
ENV NEXT_PUBLIC_MIXPANEL_TOKEN=${NEXT_PUBLIC_MIXPANEL_TOKEN}
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (instead of yarn.lock)
COPY package.json package-lock.json ./
COPY db/ ./db/

# Install dependencies using npm
RUN npm install --legacy-peer-deps

# Run the Prisma migration using Blitz.js and Prisma
RUN npx blitz prisma migrate deploy

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE ${PORT}

# Define the default command to run the application
CMD npm start -- --port ${PORT}