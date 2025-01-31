import { error } from "@sveltejs/kit"

export async function load({ params, fetch }) {
  try {
    const response = await fetch(`http://localhost:8000/api/forms/${params.id}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const form = await response.json()
    return { form }
  } catch (e) {
    throw error(404, "Form not found")
  }
}