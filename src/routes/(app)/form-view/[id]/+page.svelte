<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import { goto } from "$app/navigation";

  export let data;

  let form = null;
  let loading = true;
  let error = null;

  const api = axios.create({ baseURL: "http://localhost:8000/api" });

  onMount(async () => {
    try {
      if (!data.id) throw new Error("Form ID is undefined");
      form = await fetchForm(data.id);
      loading = false;
    } catch (err) {
      error = `Error loading form: ${err.message}`;
      loading = false;
    }
  });

  const fetchForm = async (id) => {
    try {
      const response = await api.get(`/forms/${id}`);
      return response.data;
    } catch (err) {
      error = "Failed to fetch form";
      return null;
    }
  };
</script>

<!-- UI Section -->
<div class="min-h-screen bg-gray-100 p-6">
  <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 relative">
    <!-- Back Button -->
    <button 
      class="absolute top-4 left-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
      on:click={() => goto("/template-dashboard")}
    >
      ← Back
    </button>

    {#if loading}
      <div class="space-y-4">
        {#each [1, 2, 3] as _}
          <div class="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
        {/each}
      </div>
    {:else if error}
      <p class="text-center text-red-500">{error}</p>
    {:else if form}
      <div>
        <h1 class="text-3xl font-bold mb-6 text-center">{form.formName}</h1>

        <div class="mb-4 text-center">
          <span class="font-medium">Form Status: </span>
          <span class={form.status === "active" ? "text-green-500" : "text-red-500"}>
            {form.status === "active" ? "Active" : "Inactive"}
          </span>
          <br>
          <span class="font-medium text-black">Form Status: </span>
          <span class="">
            {form.type}
          </span>
        </div>

        <div class="space-y-6">
          {#each form.fields as field (field._id)}
            <div class="border p-4 rounded-lg shadow-sm bg-gray-50">
              <p class="block text-sm font-medium text-gray-700">{field.properties.label}</p>

              {#if field.type === "input"}
                <input
                  id={field.properties.name}
                  placeholder={field.attributes?.placeholder || "Enter value"}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-gray-100"
                  disabled
                />
              {:else if field.type === "textarea"}
                <textarea
                  id={field.properties.name}
                  placeholder={field.attributes?.placeholder || "Enter text"}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-gray-100"
                  disabled
                ></textarea>
              {:else if field.type === "radio"}
                <div class="space-y-2">
                  {#each field.options as option}
                    <label class="inline-flex items-center">
                      <input
                        type="radio"
                        value={option.value}
                        class="form-radio text-blue-600"
                        disabled
                      />
                      <span class="ml-2">{option.label}</span>
                    </label>
                  {/each}
                </div>
              {:else if field.type === "checkbox"}
                <div class="space-y-2">
                  {#each field.options as option}
                    <label class="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={option.value}
                        class="form-checkbox text-blue-600"
                        disabled
                      />
                      <span class="ml-2">{option.label}</span>
                    </label>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
