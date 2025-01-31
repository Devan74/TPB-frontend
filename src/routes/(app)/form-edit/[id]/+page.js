import { error } from "@sveltejs/kit"

export async function load({ params }) {
  try {
    const response = await fetch(`http://localhost:8000/api/forms/${params.id}`)
    if (response.ok) {
      const form = await response.json()
      return { form }
    } else {
      throw error(response.status, "Failed to load form")
    }
  } catch (e) {
    console.error("Error loading form:", e)
    throw error(500, "Internal Server Error")
  }
}

