import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    revalidatePath("/");
    return new Response("Revalidated successfully", { status: 200 });
  } catch (error) {
    return new Response("Failed to revalidate", { status: 500 });
  }
}
