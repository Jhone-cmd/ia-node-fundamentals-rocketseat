import z from "zod";

const zodSchema = z.object({
    API_KEY: z.string()
})

export const env = zodSchema.parse(process.env)