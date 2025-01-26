export const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Redis Project API",
      version: "1.0.0",
      description: "API documentation for the Redis Project",
      contact: {
        name: "Sachin Thapa",
        email: "sachinthapa572@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local server",
      },
    ],
  },
  apis: ["./controllers/*.js", "./routes/*.js"],
};
